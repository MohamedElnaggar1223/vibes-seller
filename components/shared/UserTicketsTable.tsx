'use client'

import { TicketType } from "@/lib/types/ticketTypes"
import { memo, useEffect, useMemo, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Checkbox } from "../ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import Image from "next/image"
import TicketPrice from "./TicketPrice"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { addDoc, collection, doc, runTransaction, Timestamp } from "firebase/firestore"
import { db } from "@/firebase/client/config"
import { Loader2 } from "lucide-react"

type Props = {
    tickets: TicketType[]
    userId: string
}

export default function UserTicketsTable({ tickets, userId }: Props) 
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
                userId,
                eventId: ticketsSelectedWithPrice.length ? ticketsSelectedWithPrice[0].eventId : null,
                tickets: ticketsSelectedWithPrice.map(ticket => ticket.id),
                price: typeof bundlePrice === 'string' ? parseInt(bundlePrice) : bundlePrice,
                exactDate: Timestamp.now(),
                status: 'pending'
            }
            await runTransaction(db, async (transaction) => {
                await addDoc(collection(db, 'bundles'), addedBundle)

                const ticketsPromise = ticketsSelectedWithPrice.map(async (ticket) => {
                    const ticketDoc = doc(db, 'tickets', ticket.id)
                    await transaction.update(ticketDoc, { forSale: true })
                })

                await Promise.all(ticketsPromise)
            })
        }
        router.push(`/?success=${ticketsSelectedWithPrice.length}`)
        setLoading(false)
    }

    return (
        <div className='flex flex-col gap-4 w-full'>
            <Accordion type="multiple" className="w-full gap-8 flex flex-col">
                {Object.entries(ticketsGroups).map(([key, ticketsArray]) => (
                    <AccordionItem key={key} value={key} className="border-0">
                        <AccordionTrigger className='p-4 bg-black'>
                            <p className='font-poppins text-sm lg:text-base font-normal text-white'>
                                ({ticketsArray.length}) {key}
                            </p>
                            <div onClick={(e) => e.stopPropagation()} className="flex items-center space-x-2 ml-auto">
                                <Checkbox 
                                    checked={ticketsSelect[key].length === ticketsArray.length} 
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
                        <button className='px-10 py-3 bg-white rounded-sm text-black font-poppins text-xs font-medium'>Add ticket</button>
                    </div>
                    <div className='flex flex-col gap-1 items-center justify-center'>
                        <p className='font-poppins text-xs lg:text-sm font-extralight text-white'>({ticketsNumber}) Tickets Selected</p>
                        <button disabled={ticketsNumber === 0} onMouseDown={() => setConfirmedTickets(true)} className='px-8 py-4 disabled:opacity-65 bg-white rounded-sm text-black font-poppins text-xs lg:text-sm font-medium'>Confirm Selection</button>
                    </div>
                </div>
            </div>
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
            <Dialog open={loading}>
                <DialogContent className='flex items-center justify-center bg-transparent border-none outline-none'>
                    <Loader2 className='animate-spin' size={42} color="#5E1F3C" />
                </DialogContent>
            </Dialog>
        </div>
    )
}