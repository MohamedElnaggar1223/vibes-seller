'use client'
import { EventType } from "@/lib/types/eventTypes"
import { Bundle, TicketOrBundle, TicketType } from "@/lib/types/ticketTypes"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { isBundle, isTicket } from "./TicketRowContainer"
import { useCallback, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/firebase/client/config"
import { Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"


const statusOptions = {
    sold: {
        text: 'Sold',
        color: 'text-[#ff0000]',
        bg: 'bg-[#CCF5D2]'
    },
    pending: {
        text: 'Pending',
        color: 'text-[#000]',
        bg: 'bg-[#CCCCCC]'
    },
    inEscrow: {
        text: 'In Escrow',
        color: 'text-[#7D40FF]',
        bg: 'bg-[#CCCCCC]'
    },
    onSale: {
        text: 'On Sale',
        color: 'text-[#000]',
        bg: 'bg-[#CCF5D2]'
    },
    cancelled: {
        text: 'Cancelled',
        color: 'text-[#000]',
        bg: 'bg-[#CCCCCC]'
    }
}

type Props = {
    ticket: TicketOrBundle
    event: EventType
    bundleTickets: TicketType[] | undefined
}

export default function TicketRow({ event, ticket, bundleTickets }: Props)
{
    const router = useRouter()

    const isTicketCallBack = useCallback((ticket: TicketOrBundle) => isTicket(ticket), [ticket])
    const isBundleCallBack = useCallback((ticket: TicketOrBundle) => isBundle(ticket), [ticket])

    const [ticketOpen, setTicketOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [price, setPrice] = useState(isTicketCallBack(ticket) ? (ticket as TicketType).salePrice : isBundleCallBack(ticket) ? (ticket as Bundle).price : 0)

    const eventEnded = event.eventDate < new Date()

    const handleDeleteTicket = async () => {
        setLoading(true)
        const ticketDoc = doc(db, 'tickets', ticket.id)
        await updateDoc(ticketDoc, { forSale: false })
        setLoading(false)
        router.refresh()
    }

    const handleUpdatePrice = async (price: number) => {
        setLoading(true)
        const ticketDoc = doc(db, 'tickets', ticket.id)
        await updateDoc(ticketDoc, { salePrice: price })
        setLoading(false)
        router.refresh()
    }

    const handleDeleteTicketFromBundle = async (ticketId: string) => {
        setLoading(true)
        const bundleDoc = doc(db, 'bundles', ticket.id)
        await updateDoc(bundleDoc, { tickets: Object.values(ticket.tickets).filter((id) => id !== ticketId) })
        await updateDoc(doc(db, 'tickets', ticketId), { forSale: false })
        setLoading(false)
        router.refresh()
    }

    const handleUpdatePriceBundle = async (price: number) => {
        setLoading(true)
        const bundleDoc = doc(db, 'bundles', ticket.id)
        await updateDoc(bundleDoc, { price: price })
        setLoading(false)
        router.refresh()
    }

    return (
        <>
            <div onClick={() => setTicketOpen(true)} className='flex w-full items-center justify-between rounded-lg cursor-pointer'>
                {isTicketCallBack(ticket) ? (
                    <>
                        <div className='flex-1 h-[60px] font-medium flex items-center justify-between text-xs text-black text-center font-poppins'>
                            <Image
                                src={event?.displayPageImage!}
                                width={62}
                                height={60}
                                alt={event?.name!}
                                className='object-cover w-[62px] h-[60px] rounded-lg' 
                                quality={100}
                            />
                            <p className={cn('font-medium text-black h-full flex-1 text-center flex items-center justify-center', ticket.saleStatus === 'sold' ? 'bg-[#A3CCA9]' : 'bg-[#CCCCCC]')}>{event?.name}</p> 
                        </div>
                        <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', ticket.saleStatus === 'sold' ? 'bg-[#CCF5D2]' : 'bg-[#fff]')}>{Object.keys(ticket.tickets)[0]}</div>
                        <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', ticket.saleStatus === 'sold' ? 'bg-[#A3CCA9]' : 'bg-[#CCCCCC]')}>Individual Ticket</div>
                        <div className={cn('flex-[0.333333] h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', ticket.saleStatus === 'sold' ? 'bg-[#CCF5D2]' : 'bg-[#fff]')}>1</div>
                        <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins rounded-tr-lg rounded-br-lg', eventEnded && 'flex-col gap-2', statusOptions[ticket.saleStatus!].bg, statusOptions[ticket.saleStatus!].color)}>
                            {eventEnded && <p className='font-medium text-sm font-poppins text-[#ff0000]'>Event Ended</p>}
                            {(!eventEnded || ticket.saleStatus === 'inEscrow') && statusOptions[ticket.saleStatus!].text}
                        </div>
                    </>
                ) : isBundleCallBack(ticket) ? (
                    <>
                        <div className='flex-1 font-medium h-[60px] flex items-center justify-between text-xs text-black text-center font-poppins'>
                            <Image
                                src={event?.displayPageImage!}
                                width={62}
                                height={60}
                                alt={event?.name!}
                                className='object-cover w-[62px] h-[60px] rounded-lg' 
                                quality={100}
                            />
                            <p className={cn('font-medium text-black flex flex-1 text-center h-full items-center justify-center', ticket.status === 'sold' ? 'bg-[#A3CCA9]' : 'bg-[#CCCCCC]')}>{event?.name}</p> 
                        </div>
                        <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', ticket.status === 'sold' ? 'bg-[#CCF5D2]' : 'bg-[#fff]')}>Bundle Tickets</div>
                        <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', ticket.status === 'sold' ? 'bg-[#A3CCA9]' : 'bg-[#CCCCCC]')}>Bundle</div>
                        <div className={cn('flex-[0.333333] h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', ticket.status === 'sold' ? 'bg-[#CCF5D2]' : 'bg-[#fff]')}>{ticket.tickets.length}</div>
                        <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins rounded-tr-lg rounded-br-lg', eventEnded && 'flex-col gap-2', statusOptions[ticket.status!].bg, statusOptions[ticket.status!].color)}>
                            {eventEnded && <p className='font-medium text-sm font-poppins text-[#ff0000]'>Event Ended</p>}
                            {(!eventEnded || ticket.status === 'inEscrow') &&statusOptions[ticket.status!].text}
                        </div>
                    </>
                ) : null}
            </div>
            <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
                <DialogContent className='flex flex-col gap-6 w-full border-none outline-none py-12 z-[9999999999999999]'>
                    <DialogHeader className='flex items-center justify-center'>
                        <DialogTitle className={cn('font-medium font-poppins text-center', ((isTicketCallBack(ticket) && ticket.saleStatus === 'cancelled') || (isBundleCallBack(ticket) && ticket.status === 'cancelled')) && 'text-[#ff0000]')}>
                            {isTicketCallBack(ticket) && Object.keys(ticket.tickets)[0]} {isTicketCallBack(ticket) ? "Ticket" : "Bundle"} for {event.name} {((isTicketCallBack(ticket) && ticket.saleStatus === 'cancelled') || (isBundleCallBack(ticket) && ticket.status === 'cancelled')) && 'Rejected'}
                            {((isTicketCallBack(ticket) && ticket.saleStatus === 'pending') || (isBundleCallBack(ticket) && ticket.status === 'pending')) && <span className='text-[#ff0000] w-full !text-center mt-2 !mx-auto'><br/><br/>Pending</span>}
                        </DialogTitle>
                    </DialogHeader>
                    {isTicketCallBack(ticket) ? (
                        <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2', eventEnded && (ticket.saleStatus !== 'inEscrow' && ticket.saleStatus !== 'sold') && 'opacity-40')}>
                            <div className='flex gap-2 items-center justify-center'>
                                <div className={cn('w-6 h-6 rounded-full', ticket.saleStatus === 'pending' ? 'bg-[#D9D9D9]' : 'bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]')} />
                                <p className='font-medium text-sm font-poppins text-white'>
                                    {Object.keys(ticket.tickets)[0]}{" "}
                                    {(Object.keys(ticket.seats).length > 0) && <span className='text-[#00CB20]'>R{Object.keys(ticket.seats)[0].split("_")[1]?.split("-")[1]} S{Object.keys(ticket.seats)[0].split("_")[2]?.split("-")[1]}</span>}
                                </p>
                            </div>
                            <div className='flex gap-2 items-center'>
                                <div className='p-1 bg-[#55555580] rounded-[4px] flex items-center justify-center text-center'>
                                    <input autoFocus={false} value={price} onChange={(e) => (/^-?\d*\.?\d+$/.test(e.target.value) || e.target.value === '') ? setPrice(e.target.value) : setPrice(prev => prev)} placeholder="0.00" className='text-center text-white font-poppins text-sm font-normal bg-transparent outline-none w-[3.5rem]' />
                                    <p className='font-medium text-sm font-poppins text-white'>{ticket.country}</p>
                                </div>
                                {(typeof price === 'string' ? parseFloat(price) : price) !== ticket.salePrice && <div className='cursor-pointer rounded-full w-5 h-5 bg-white flex items-center justify-center' onClick={() => handleUpdatePrice(typeof price === 'string' ? parseFloat(price) : price!)}><Check size={16} /></div>}
                            </div>
                            {(ticket.saleStatus !== 'inEscrow' && ticket.saleStatus !== 'sold' && ticket.saleStatus !== 'cancelled' && !eventEnded) && <p onMouseDown={handleDeleteTicket} className='font-medium text-xs underline font-poppins cursor-pointer text-white'>Delete Ticket</p>} 
                            {ticket.saleStatus === 'inEscrow' && <p className='text-xs font-medium font-poppins text-[#7061A3]'>In Escrow</p>}
                            {ticket.saleStatus === 'sold' && <p className='text-xs font-medium font-poppins text-[#FF0000]'>Sold</p>}
                            {eventEnded && (ticket.saleStatus !== 'inEscrow' && ticket.saleStatus !== 'sold') && <p className='text-xs font-medium font-poppins text-[#ff0000]'>Event Ended</p>}
                        </div>
                    ) : isBundleCallBack(ticket) ? (
                        <div className='flex gap-2 w-full flex-col'>
                            <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2', eventEnded && (ticket.status !== 'inEscrow' && ticket.status !== 'sold') && 'opacity-40')}>
                                <p className='font-medium text-sm font-poppins text-white'>
                                    Bundle Price
                                </p>
                                <div className='flex gap-2 items-center'>
                                    <div className='p-1 bg-[#55555580] rounded-[4px] flex items-center justify-center text-center'>
                                        <input autoFocus={false} value={price} onChange={(e) => (/^-?\d*\.?\d+$/.test(e.target.value) || e.target.value === '') ? setPrice(e.target.value) : setPrice(prev => prev)} placeholder="0.00" className='text-center text-white font-poppins text-sm font-normal bg-transparent outline-none w-[3.5rem]' />
                                        <p className='font-medium text-sm font-poppins text-white'>{bundleTickets && bundleTickets[0].country}</p>
                                    </div>
                                    {(typeof price === 'string' ? parseFloat(price) : price) !== ticket.price && <div className='cursor-pointer rounded-full w-5 h-5 bg-white flex items-center justify-center' onClick={() => handleUpdatePriceBundle(typeof price === 'string' ? parseFloat(price) : price!)}><Check size={16} /></div>}
                                </div>
                            </div>

                            {bundleTickets?.map(bundleTicket => (
                                <div key={bundleTicket.id} className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2', eventEnded && (ticket.status !== 'inEscrow' && ticket.status !== 'sold') && 'opacity-40')}>
                                    <div className='flex gap-2 items-center justify-center'>
                                        <div className={cn('w-6 h-6 rounded-full', ticket.status === 'pending' ? 'bg-[#D9D9D9]' : 'bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]')} />
                                        <p className='font-medium text-sm font-poppins text-white'>
                                            {Object.keys(bundleTicket.tickets)[0]}{" "}{bundleTicket.id}
                                            {(Object.keys(bundleTicket.seats).length > 0) && <span className='text-[#00CB20]'>R{Object.keys(bundleTicket.seats)[0].split("_")[1]?.split("-")[1]} S{Object.keys(bundleTicket.seats)[0].split("_")[2]?.split("-")[1]}</span>}
                                        </p>
                                    </div>
                                    {(ticket.status !== 'inEscrow' && ticket.status !== 'sold' && ticket.status !== 'cancelled' && !eventEnded) && <p onMouseDown={() => handleDeleteTicketFromBundle(bundleTicket.id)} className='font-medium text-xs underline font-poppins cursor-pointer text-white'>Delete Ticket</p>} 
                                    {ticket.status === 'inEscrow' && <p className='text-xs font-medium font-poppins text-[#7061A3]'>In Escrow</p>}
                                    {ticket.status === 'sold' && <p className='text-xs font-medium font-poppins text-[#FF0000]'>Sold</p>}
                                    {eventEnded && (ticket.status !== 'inEscrow' && ticket.status !== 'sold') && <p className='text-xs font-medium font-poppins text-[#ff0000]'>Event Ended</p>}
                                </div>
                            ))}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
            <Dialog open={loading}>
                <DialogContent className='flex items-center justify-center bg-transparent border-none outline-none z-[9999999999999999]'>
                    <Loader2 className='animate-spin' size={42} color="#5E1F3C" />
                </DialogContent>
            </Dialog>
        </>
    )
}