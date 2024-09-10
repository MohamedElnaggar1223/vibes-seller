'use client'

import { TicketType } from "@/lib/types/ticketTypes"
import { memo, useEffect, useMemo, useRef, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Checkbox } from "../ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import Image from "next/image"
import TicketPrice from "./TicketPrice"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { addDoc, collection, doc, runTransaction, Timestamp } from "firebase/firestore"
import { db, storage } from "@/firebase/client/config"
import { ChevronDown, Loader2 } from "lucide-react"
import { EventType } from "@/lib/types/eventTypes"
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { updateRoute } from "@/lib/actions/tickets"
import { UserType } from "@/lib/types/userTypes"

type Props = {
    tickets: TicketType[]
    user: UserType
    event: EventType
}

type UploadedTicket = {
    ticket: File
    seat: {
        row: number | undefined
        column: number | undefined
    }
}[]

export default function UserTicketsTable({ tickets, user, event }: Props) 
{
    const router = useRouter()

    const ticketsGroups = useMemo(() => {
        let ticketsCategories: { [key: string]: TicketType[] } = {}

        tickets.forEach(ticket => {
            const type = Object.keys(ticket.tickets)[0]
            if (!ticketsCategories[type]) {
                ticketsCategories[type] = []
            }

            ticketsCategories[type].push(ticket)
        })

        return ticketsCategories
    }, [tickets])

    const [ticketsSelect, setTicketsSelect] = useState(Object.keys(ticketsGroups).reduce((acc, key) => { acc[key] = []; return acc; }, {} as { [key: string]: TicketType[] }))
    const [confirmedTickets, setConfirmedTickets] = useState(false)
    const [sellingType, setSellingType] = useState<'individual' | 'bundle' | undefined>(undefined)
    const [choosePricesOpen, setChoosePricesOpen] = useState(false)
    const [ticketsSelectedWithPrice, setTicketsSelectedWithPrice] = useState<(TicketType & { salePrice: string })[]>([])
    const [unifyPriceOpen, setUnifyPriceOpen] = useState(false)
    const [unifyPrice, setUnifyPrice] = useState(false)
    const [unifyPriceValue, setUnifyPriceValue] = useState('')
    const [agreeToTerms, setAgreeToTerms] = useState(false)
    const [bundlePrice, setBundlePrice] = useState('')
    const [loading, setLoading] = useState(false)
    const [addTicketsOpen, setAddTicketsOpen] = useState(false)
    const [ticketsType, setTicketsType] = useState('')
    const [platform, setPlatform] = useState('')
    const [uploadedTickets, setUploadedTickets] = useState<UploadedTicket | null>(null)
    const [addTicketsSeatsOpen, setAddTicketsSeatsOpen] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const ticketsNumber = useMemo(() => Object.values(ticketsSelect).reduce((acc, tickets) => acc + tickets.length, 0), [ticketsSelect])

    useEffect(() => {
        setTicketsSelectedWithPrice(() => {
            let ticketsWithPrice: (TicketType & { salePrice: string })[] = []

            Object.entries(ticketsSelect).forEach(([key, tickets]) => {
                tickets.forEach(ticket => {
                    ticketsWithPrice.push({ ...ticket, salePrice: '' })
                })
            })

            return ticketsWithPrice
        })
    }, [ticketsSelect])

    const handleSellTickets = async () => {
        setLoading(true)
        if(sellingType === 'individual') 
        {
            await runTransaction(db, async (transaction) => {
                const ticketsPromise = ticketsSelectedWithPrice.map(async (ticket) => {
                    const salePrice = typeof ticket.salePrice === 'string' ? parseInt(ticket.salePrice) : typeof ticket.salePrice === 'number' ? ticket.salePrice : 0
                    const ticketDoc = doc(db, 'tickets', ticket.id)
                    await transaction.update(ticketDoc, { forSale: true, saleStatus: 'pending', salePrice })
                })
    
                await Promise.all(ticketsPromise)
            })
        }
        else if(sellingType === 'bundle') 
        {
            const addedBundle = {
                userId: user.id,
                eventId: ticketsSelectedWithPrice.length ? ticketsSelectedWithPrice[0].eventId : null,
                tickets: ticketsSelectedWithPrice.map(ticket => ticket.id),
                price: typeof bundlePrice === 'string' ? parseInt(bundlePrice) : bundlePrice,
                createdAt: Timestamp.now(),
                status: 'pending'
            }
            await runTransaction(db, async (transaction) => {

                const bundleDoc = await addDoc(collection(db, 'bundles'), addedBundle)

                const ticketsPromise = ticketsSelectedWithPrice.map(async (ticket) => {
                    const ticketDoc = doc(db, 'tickets', ticket.id)
                    await transaction.update(ticketDoc, { forSale: true, bundleId: bundleDoc.id })
                })

                await Promise.all(ticketsPromise)
            })
        }
        router.push(`/?success=${ticketsSelectedWithPrice.length}`)
        setLoading(false)
    }

    const handleUploadTicketsPdfs = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files

        if(!files) return

        const ticketsUploadedArray = Array.from(files).map(file => ({ ticket: file, seat: { row: undefined, column: undefined } }))

        setUploadedTickets(ticketsUploadedArray)
    }

    const handleUploadTickets = async () => {
        setAddTicketsSeatsOpen(false)
        if(!uploadedTickets || !ticketsType || !platform) return

        setLoading(true)

        await runTransaction(db, async (transaction) => {
            const ticketsCollection = collection(db, 'tickets')
            const userDoc = doc(db, 'users', user.id!)
            const userTickets = user.tickets ?? []

            const ticketsPromise = Array.from(uploadedTickets).map(async (ticketUploaded) => {
                const ticketDoc = doc(ticketsCollection)

                const ticket = {
                    country: 'Egypt',
                    createdAt: Timestamp.now() as any,
                    eventId: event.id,
                    forSale: false,
                    parkingPass: 0,
                    platform: platform,
                    seats: event.seated ? ticketUploaded.seat : {},
                    status: 'paid',
                    saleStatus: 'pending',
                    tickets: { [ticketsType]: 1 },
                    userId: user.id,
                    totalPaid: 0,
                    id: ticketDoc.id
                } as TicketType

                await transaction.set(ticketDoc, ticket)
                userTickets.push(ticketDoc.id)
                await transaction.update(userDoc, { tickets: userTickets })

                const storageRef = ref(storage, `tickets/events/${event.id}/${ticketsType}/${event.seated ? `${ticketsType}_Row-${ticketUploaded.seat.row}_Seat-${ticketUploaded.seat.column}` : ticket.id}.pdf`)
                await uploadBytesResumable(storageRef, ticketUploaded.ticket);
            })

            await Promise.all(ticketsPromise)
        })

        setUploadedTickets(null)
        setAddTicketsOpen(false)
        setLoading(false)

        await updateRoute(`/${event.id}`)
    }

    return (
        <div className='flex flex-col gap-4 w-full'>
            {tickets.length > 0 ? (
                <>
                    <Accordion type="multiple" className="w-full gap-8 flex flex-col">
                        {Object.entries(ticketsGroups).map(([key, ticketsArray]) => (
                            <AccordionItem key={key} value={key} className="border-0">
                                <AccordionTrigger className='p-4 bg-black'>
                                    <p className='font-poppins text-sm lg:text-base font-normal text-white'>
                                        ({ticketsArray.length}) {key}
                                    </p>
                                    <div onClick={(e) => e.stopPropagation()} className="flex items-center space-x-2 ml-auto">
                                        <Checkbox 
                                            checked={ticketsSelect[key]?.length === ticketsArray.length} 
                                            onCheckedChange={() => setTicketsSelect(prev => ({ ...prev, [key]: prev[key].length === ticketsArray.length ? [] : ticketsArray }))}
                                            id="selectAll" 
                                            className='bg-white font-poppins checked:bg-white aria-checked:bg-white min-w-5 min-h-5'
                                        />
                                        <label
                                            htmlFor="selectAll"
                                            className="text-sm lg:text-base font-poppins text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Select All
                                        </label>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className='flex flex-wrap gap-4 mt-4'>
                                        {ticketsArray.map(ticket => (
                                            <div key={ticket.id} className='flex rounded-sm items-center justify-between flex-[1_1_40%] bg-[rgba(0,0,0,0.4)] py-4 px-8 text-white'>
                                                <div className='flex items-center gap-4'>
                                                    <Checkbox 
                                                        checked={ticketsSelect[key].includes(ticket)} 
                                                        onCheckedChange={() => setTicketsSelect(prev => ({ ...prev, [key]: prev[key].includes(ticket) ? prev[key].filter(t => t !== ticket) : [...prev[key], ticket] }))}
                                                        id={ticket.id}
                                                        className='min-w-6 min-h-6 bg-white'
                                                    />
                                                    <label
                                                        htmlFor={ticket.id}
                                                        className="text-base font-normal font-poppins leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {Object.keys(ticket.tickets)[0]}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <div className='w-full sticky bottom-0'>
                        <div className='flex items-center justify-between pb-4'>
                            <div className='flex flex-col gap-1'>
                                <p className='font-poppins text-xs font-light text-white'>Have other tickets?</p>
                                <button onMouseDown={() => setAddTicketsOpen(true)} className='px-10 py-3 bg-white rounded-sm text-black font-poppins text-xs font-medium'>Add ticket</button>
                            </div>
                            <div className='flex flex-col gap-1 items-center justify-center'>
                                <p className='font-poppins text-xs lg:text-sm font-extralight text-white'>({ticketsNumber}) Tickets Selected</p>
                                <button disabled={ticketsNumber === 0} onMouseDown={() => setConfirmedTickets(true)} className='px-8 py-4 disabled:opacity-65 bg-white rounded-sm text-black font-poppins text-xs lg:text-sm font-medium'>Confirm Selection</button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className='flex flex-col items-center justify-center w-full gap-4'>
                    <p className='font-poppins text-xs text-white'>Start adding tickets & putting them up for sale!</p>
                    <button onMouseDown={() => setAddTicketsOpen(true)} className='px-10 py-3 bg-white rounded-sm text-black font-poppins text-xs font-medium'>Add Tickets</button>
                </div>
            )}
            <Dialog open={confirmedTickets} onOpenChange={setConfirmedTickets}>
                <DialogContent className="sm:max-w-[512px] gap-8">
                    <DialogHeader className='flex items-center justify-center'>
                        <DialogTitle className='font-bold'>Do you want to sell ({ticketsNumber}) tickets as</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col items-start justify-center gap-4 w-screen max-w-[248px] mx-auto'>
                        <div className='flex items-center gap-4 w-full'>
                            <Checkbox 
                                checked={sellingType === 'individual'} 
                                onCheckedChange={() => setSellingType('individual')}
                                className='min-w-4 min-h-4 rounded-full bg-[#D9D9D9] outline-none border-none [&_svg]:stroke-none'
                                id='individual'
                            />
                            <label
                                htmlFor='individual'
                                className="text-base font-semibold font-poppins leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Individual Tickets
                            </label>
                        </div>
                        <div className='flex items-center gap-4 w-full'>
                            <Checkbox 
                                checked={sellingType === 'bundle'} 
                                onCheckedChange={() => setSellingType('bundle')}
                                className='min-w-4 min-h-4 rounded-full bg-[#D9D9D9] outline-none border-none [&_svg]:stroke-none'
                                id='bundle'
                            />
                            <label
                                htmlFor='bundle'
                                className="text-base font-semibold font-poppins leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Bundle
                            </label>
                        </div>
                    </div>
                    <DialogFooter className='flex w-full items-center justify-center'>
                        <button 
                            onClick={() => {
                                setConfirmedTickets(false)
                                setChoosePricesOpen(true)
                            }} 
                            disabled={!sellingType} 
                            className='px-10 py-4 text-white disabled:bg-[#A7A6A6] disabled:from-[#A7A6A6] disabled:to-[#A7A6A6] bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] rounded-sm font-poppins text-xs lg:text-sm font-medium mx-auto'
                        >
                            Confirm
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={choosePricesOpen} onOpenChange={setChoosePricesOpen}>
                <DialogContent>
                    <DialogHeader className='flex items-center justify-center gap-2'>
                        <h2 className="text-base font-semibold font-poppins leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Please set price for ({ticketsNumber}) tickets
                        </h2>
                        <div className='flex gap-1 items-start justify-center'>
                            <Image
                                src="/assets/bulb.svg"
                                alt="bulb"
                                width={17}
                                height={17} 
                            />
                            <p className='font-poppins font-normal text-sm text-center'>
                                Tip : we recommend you half the ticket/bundle price as this <br />
                                will increase the chances of being sold!
                            </p>
                        </div>
                    </DialogHeader>
                    {sellingType === 'individual' ? (
                        <div className='flex flex-col gap-4'>
                            {unifyPrice ? (
                                <p onClick={() => {setUnifyPrice(false); setTicketsSelectedWithPrice(prev => prev.map(ticket => ({...ticket, salePrice: ''})))}} className={cn('ml-auto underline font-poppins font-normal text-base text-center cursor-pointer unify-price')}>
                                    Cancel Unify Price
                                </p>
                            ) : (
                                <p onClick={() => {setUnifyPrice(true); setUnifyPriceOpen(true)}} className={cn('ml-auto underline font-poppins font-normal text-base text-center cursor-pointer')}>
                                    Unify Price
                                </p>
                            ) }
                            <div className='flex flex-col w-full gap-2 max-h-[480px] overflow-auto'>
                                {ticketsSelectedWithPrice.map((ticket, index) => <TicketPrice index={index} key={ticket.id} ticket={ticket} setTicketsSelectedWithPrice={setTicketsSelectedWithPrice} />)}
                            </div>
                            <div className='w-full mt-8 flex items-center justify-center gap-2'>
                                <button 
                                    onClick={() => {
                                        setChoosePricesOpen(false)
                                    }} 
                                    className='text-center font-poppins rounded-[6px] text-black bg-[#FFF1F1] py-3 w-[45%]'
                                >
                                    Cancel
                                </button>
                                <button 
                                    disabled={ticketsSelectedWithPrice.find(ticket => !ticket.salePrice) !== undefined} 
                                    onClick={() => setAgreeToTerms(true)}
                                    className='text-center font-poppins rounded-[6px] text-white py-3 w-[45%] disabled:bg-[#A7A6A6] disabled:from-[#A7A6A6] disabled:to-[#A7A6A6] bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]'
                                >
                                    Sell Tickets
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-col w-full gap-2 max-h-[480px] overflow-auto'>
                                <div className='flex pl-6 pr-12 py-1 items-center justify-between bg-black w-full'>
                                    <p className='font-poppins font-semibold text-base w-20 text-center text-white'>Bundle</p>
                                    <p className='font-poppins text-sm w-20 text-center text-white'>Bundle Price</p>
                                </div>
                                <div className='flex w-full gap-2 px-2 relative'>
                                    <div className='flex flex-1 flex-col items-start justify-start gap-2'>
                                        {ticketsSelectedWithPrice.map((ticket, index) => (
                                            <div className="flex gap-1">
                                                <p className={cn('rounded-full text-sm h-7 w-7 text-white flex items-center justify-center text-center font-poppins', parseInt(bundlePrice) ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'bg-[#D9D9D9]')}>{index + 1}</p>
                                                <p className='font-poppins text-base w-20 text-center text-black'>{Object.keys(ticket.tickets)[0]}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 flex items-end justify-start">
                                        <input value={bundlePrice} onChange={(e) => setBundlePrice(prev => /^-?\d+(\.\d+)?$/.test(e.target.value) ? e.target.value : prev)} placeholder="0.00 EGP" className='bg-[#1E1E1E] sticky top-2 mb-auto ml-auto rounded-sm w-20 text-center h-7 text-white font-poppins text-sm font-normal' />
                                    </div>
                                </div>
                            </div>
                            <div className='w-full mt-8 flex items-center justify-center gap-2'>
                                <button 
                                    onClick={() => {
                                        setChoosePricesOpen(false)
                                    }} 
                                    className='text-center font-poppins rounded-[6px] text-black bg-[#FFF1F1] py-3 w-[45%]'
                                >
                                    Cancel
                                </button>
                                <button 
                                    disabled={!bundlePrice} 
                                    onClick={() => setAgreeToTerms(true)}
                                    className='text-center font-poppins rounded-[6px] text-white py-3 w-[45%] disabled:bg-[#A7A6A6] disabled:from-[#A7A6A6] disabled:to-[#A7A6A6] bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]'
                                >
                                    Sell Bundle
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={unifyPriceOpen} onOpenChange={setUnifyPriceOpen}>
                <DialogContent>
                    <DialogHeader className='flex items-center justify-center gap-2'>
                        <h2 className="text-base font-semibold font-poppins leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Please set price for ({ticketsNumber}) tickets
                        </h2>
                        <div className='flex gap-1 items-start justify-center'>
                            <Image
                                src="/assets/bulb.svg"
                                alt="bulb"
                                width={17}
                                height={17} 
                            />
                            <p className='font-poppins font-normal text-sm text-center'>
                                Tip : we recommend you half the ticket/bundle price as this <br />
                                will increase the chances of being sold!
                            </p>
                        </div>
                    </DialogHeader>
                    <input placeholder="Price Per Ticket" className='outline-none text-center mx-auto rounded-md w-fit px-1 py-4 bg-white shadow-2xl border border-[rgba(0,0,0,0.15)]' value={unifyPriceValue} onChange={(e) => setUnifyPriceValue(prev => /^-?\d+(\.\d+)?$/.test(e.target.value) ? e.target.value : prev)} />
                    <button 
                        disabled={!unifyPriceValue} 
                        onClick={() => {
                            setTicketsSelectedWithPrice(prev => prev.map(ticket => ({ ...ticket, salePrice: unifyPriceValue })))
                            setUnifyPriceOpen(false)
                        }} 
                        className='px-10 py-4 text-white disabled:bg-[#A7A6A6] disabled:from-[#A7A6A6] disabled:to-[#A7A6A6] bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] rounded-sm font-poppins text-xs lg:text-sm font-medium mx-auto'
                    >
                        Confirm Price
                    </button>
                </DialogContent>
            </Dialog>
            <Dialog open={agreeToTerms} onOpenChange={setAgreeToTerms}>
                <DialogContent className='flex flex-col gap-2 items-center justify-center py-16 px-4 w-screen max-w-[620px]'>
                    <p className='text-center font-poppins text-base'>
                        Upon agreeing to sell tickets bought from a platform other than Vibes, your money will be held by Vibes and released into your bank account once event ends. Funds usually takes 15-20 days to be released into sellers bank account.
                    </p>
                    <div className='w-full mt-8 flex items-center justify-center gap-2'>
                        <button 
                            onClick={() => {
                                setAgreeToTerms(false)
                                setChoosePricesOpen(false)
                            }}
                            className='text-center font-poppins rounded-[6px] text-black bg-[#FFF1F1] py-3 w-[45%]'
                        >
                            Decline
                        </button>
                        <button 
                            onClick={handleSellTickets} 
                            className='text-center font-poppins rounded-[6px] text-white py-3 w-[45%] bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]'
                        >
                            Agree to terms
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={addTicketsOpen} onOpenChange={setAddTicketsOpen}>
                <DialogContent className='flex flex-col gap-4 p-12'>
                    <DialogHeader className='flex items-center justify-center font-bold'>
                        Please enter ticket details
                    </DialogHeader>
                    <div className='flex items-center justify-center relative'>
                        <div className='min-w-[1px] w-[1px] min-h-12 z-10 bg-gray-200 absolute right-[20%] text-white' />
                        <select value={ticketsType} onChange={(e) => setTicketsType(e.target.value)} className='rounded-[6px] w-full bg-white shadow-[0px_0px_4px_2px_rgba(0,0,0,0.15)] py-4 px-6 font-poppins relative text-black outline-none cursor-pointer select-dialog'>
                            <option value="" className='hidden' disabled selected>Choose Ticket's Category</option>
                            {event.tickets.map(ticket => (
                                <option className='bg-black text-white' key={ticket.name} value={ticket.name}>
                                    {ticket.name}
                                </option>
                            ))}
                        </select>
                        {/* <ChevronDown onClick={() => {firstSelectRef.current?.focus();firstSelectRef.current?.click();}} size={20} className='absolute z-20 right-[7.5%]' /> */}
                    </div>
                    <div className='flex items-center justify-center relative'>
                        <div className='min-w-[1px] min-h-2 bg-black absolute right-[20%]' />
                        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className='rounded-[6px] w-full bg-white shadow-[0px_0px_4px_2px_rgba(0,0,0,0.15)] py-4 px-6 font-poppins relative text-black outline-none cursor-pointer select-dialog'>
                            <option value="" className='hidden' disabled selected>Platform</option>
                            <option className='bg-black text-white' value="Tickets Mall">
                                Tickets Mall
                            </option>
                            <option className='bg-black text-white' value="WeBook.com">
                                WeBook.com
                            </option>
                        </select>
                    </div>
                    <div onClick={() => fileInputRef.current?.click()} className='rounded-[6px] gap-4 flex items-center justify-center w-full bg-white shadow-[0px_0px_4px_2px_rgba(0,0,0,0.15)] py-4 px-6 font-poppins relative text-black outline-none cursor-pointer'>
                        <input onChange={handleUploadTicketsPdfs} className='hidden absolute w-full h-full' type='file' multiple accept=".pdf" ref={fileInputRef} />
                        {uploadedTickets?.length ? (
                            <Image
                                src='/assets/uploadedCheck.svg'
                                alt='upload'
                                width={23}
                                height={24} 
                            />
                        ) : (
                            <Image
                                src='/assets/upload.svg'
                                alt='upload'
                                width={32}
                                height={26} 
                            />
                        )}
                        {uploadedTickets?.length ? (
                            <div className='flex flex-col items-center justify-center'>
                                <p className='font-light text-sm'>({uploadedTickets.length})</p>
                                <p className='font-light text-[10px]'>Tickets Uploaded</p>
                            </div>
                        ) : (
                            <div className='flex flex-col items-center justify-center'>
                                <p className='font-light text-xs'>Upload Ticket</p>
                                <p className='font-light text-[10px] text-[rgba(0,0,0,0.5)]'>PDF</p>
                            </div>
                        )}
                        {(uploadedTickets?.length ?? 0) > 0 && <p onClick={(e) => {e.stopPropagation(); setUploadedTickets(null)}} className='text-[rgba(0,0,0,0.5)] absolute top-[70%] right-[5%] underline text-[10px]'>Delete</p>}
                    </div>
                    {event.seated ? (
                        <button 
                            disabled={!uploadedTickets || !ticketsType || !platform}
                            className='px-10 py-4 mt-2 text-white disabled:bg-[#A7A6A6] disabled:from-[#A7A6A6] disabled:to-[#A7A6A6] bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] rounded-sm font-poppins text-xs lg:text-sm font-medium mx-auto'
                            onClick={() => setAddTicketsSeatsOpen(true)}
                        >
                            Next
                        </button>
                    ) : (
                        <button 
                            disabled={!uploadedTickets || !ticketsType || !platform}
                            className='px-10 py-4 mt-2 text-white disabled:bg-[#A7A6A6] disabled:from-[#A7A6A6] disabled:to-[#A7A6A6] bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] rounded-sm font-poppins text-xs lg:text-sm font-medium mx-auto'
                            onClick={handleUploadTickets}
                        >
                            Add Tickets
                        </button>
                    )}
                </DialogContent>    
            </Dialog>
            <Dialog open={addTicketsSeatsOpen} onOpenChange={setAddTicketsSeatsOpen}>
                <DialogContent className='flex flex-col gap-4 px-2'>
                    <DialogHeader className='flex items-center justify-center font-bold'>
                        Please type in the seat , column and row number of ({uploadedTickets?.length}) Tickets
                    </DialogHeader>
                    <div className='flex flex-col w-full gap-2 max-h-[480px] overflow-auto'>
                        {Array.from(uploadedTickets ?? []).map((ticket, index) => (
                            <div key={index} className='flex items-center justify-center flex-col gap-2 w-full mb-4'>
                                <div className='flex pl-6 pr-12 py-1 items-center justify-between bg-black w-full'>
                                    <p className={cn('rounded-full text-sm h-7 w-7 text-white flex items-center justify-center text-center font-poppins', (ticket.seat.row && ticket.seat.column) ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'bg-[#D9D9D9]')}>{index + 1}</p>
                                    <div className='flex w-1/2 gap-6'>
                                        <p className='font-poppins text-sm w-20 text-center text-white text-nowrap'>Row Number</p>
                                        <p className='font-poppins text-sm w-20 text-center text-white text-nowrap'>Seat Number</p>
                                    </div>
                                </div>
                                <div className='flex pl-6 pr-12 items-center justify-between w-full'>
                                    <p className='font-poppins text-sm font-medium text-black w-1/2'>{ticket.ticket.name.replace('.pdf', '')}</p>
                                    <div className='flex w-1/2 gap-6'>
                                        <input value={ticket.seat.row} onChange={(e) => setUploadedTickets(prev => (/^-?\d+(\.\d+)?$/.test(e.target.value) && prev) ? prev.map((ticketDoc, indexPrev) => index === indexPrev ? ({...ticketDoc, seat: { column: ticketDoc.seat.column, row: typeof e.target.value === 'string' ? parseInt(e.target.value) : ticket.seat.row } }) : ticketDoc) : prev)} placeholder="0" className='bg-[#1E1E1E] rounded-sm w-20 text-center h-7 text-white font-poppins text-sm font-normal focus:outline-none' />
                                        <input value={ticket.seat.column} onChange={(e) => setUploadedTickets(prev => (/^-?\d+(\.\d+)?$/.test(e.target.value) && prev) ? prev.map((ticketDoc, indexPrev) => index === indexPrev ? ({...ticketDoc, seat: { row: ticketDoc.seat.row, column: typeof e.target.value === 'string' ? parseInt(e.target.value) : ticket.seat.column } }) : ticketDoc) : prev)} placeholder="0" className='bg-[#1E1E1E] rounded-sm w-20 text-center h-7 text-white font-poppins text-sm font-normal focus:outline-none' />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='w-full mt-8 flex items-center justify-center gap-2'>
                        <button 
                            onClick={() => {
                                setChoosePricesOpen(false)
                                setAddTicketsOpen(false)
                            }} 
                            className='text-center font-poppins rounded-[6px] text-black bg-[#FFF1F1] py-3 w-[45%]'
                        >
                            Cancel
                        </button>
                        <button 
                            disabled={Array.from(uploadedTickets ?? []).find(ticket => !ticket.ticket || !ticket.seat.column || !ticket.seat.row) !== undefined} 
                            onClick={handleUploadTickets}
                            className='text-center font-poppins rounded-[6px] text-white py-3 w-[45%] disabled:bg-[#A7A6A6] disabled:from-[#A7A6A6] disabled:to-[#A7A6A6] bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]'
                        >
                            Sell Tickets
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={loading}>
                <DialogContent className='flex items-center justify-center bg-transparent border-none outline-none'>
                    <Loader2 className='animate-spin' size={42} color="#5E1F3C" />
                </DialogContent>
            </Dialog>
        </div>
    )
}