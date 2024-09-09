'use client'
import { EventType } from "@/lib/types/eventTypes"
import { TicketOrBundle } from "@/lib/types/ticketTypes"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { isBundle, isTicket } from "./TicketRowContainer"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/firebase/client/config"
import { Loader2 } from "lucide-react"
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
}

export default function TicketRow({ event, ticket }: Props)
{
    const router = useRouter()

    const [ticketOpen, setTicketOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const eventEnded = event.eventDate < new Date()

    const handleDeleteTicket = async () => {
        setLoading(true)
        const ticketDoc = doc(db, 'tickets', ticket.id)
        await updateDoc(ticketDoc, { forSale: false })
        setLoading(false)
        router.refresh()
    }

    return (
        <>
            <div onClick={() => setTicketOpen(true)} className='flex w-full items-center justify-between rounded-lg cursor-pointer'>
                {isTicket(ticket) ? (
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
                ) : isBundle(ticket) ? (
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
                <DialogContent className='flex flex-col gap-6 w-full border-none outline-none py-12'>
                    <DialogHeader className='flex items-center justify-center'>
                        <DialogTitle className={cn('font-medium font-poppins text-center', ((isTicket(ticket) && ticket.saleStatus === 'cancelled') || (isBundle(ticket) && ticket.status === 'cancelled')) && 'text-[#ff0000]')}>
                            {Object.keys(ticket.tickets)[0]} Ticket for {event.name} {((isTicket(ticket) && ticket.saleStatus === 'cancelled') || (isBundle(ticket) && ticket.status === 'cancelled')) && 'Rejected'}
                            {((isTicket(ticket) && ticket.saleStatus === 'pending') || (isBundle(ticket) && ticket.status === 'pending')) && <span className='text-[#ff0000] w-full !text-center mt-2 !mx-auto'><br/><br/>Pending</span>}
                        </DialogTitle>
                    </DialogHeader>
                    {isTicket(ticket) ? (
                        <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2', eventEnded && (ticket.saleStatus !== 'inEscrow' && ticket.saleStatus !== 'sold') && 'opacity-40')}>
                            <div className='flex gap-2 items-center justify-center'>
                                <div className={cn('w-6 h-6 rounded-full', ticket.saleStatus === 'pending' ? 'bg-[#D9D9D9]' : 'bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]')} />
                                <p className='font-medium text-sm font-poppins text-white'>
                                    {Object.keys(ticket.tickets)[0]}{" "}
                                    {(Object.keys(ticket.seats).length > 0) && <span className='text-[#00CB20]'>R{Object.keys(ticket.seats)[0].split("_")[1]?.split("-")[1]} S{Object.keys(ticket.seats)[0].split("_")[2]?.split("-")[1]}</span>}
                                </p>
                            </div>
                            <p className='font-medium text-sm font-poppins text-white'>{ticket.salePrice} {ticket.country}</p>
                            {(ticket.saleStatus !== 'inEscrow' && ticket.saleStatus !== 'sold' && ticket.saleStatus !== 'cancelled' && !eventEnded) && <p onMouseDown={handleDeleteTicket} className='font-medium text-xs underline font-poppins cursor-pointer text-white'>Delete Ticket</p>} 
                            {ticket.saleStatus === 'inEscrow' && <p className='text-xs font-medium font-poppins text-[#7061A3]'>In Escrow</p>}
                            {ticket.saleStatus === 'sold' && <p className='text-xs font-medium font-poppins text-[#FF0000]'>Sold</p>}
                            {eventEnded && (ticket.saleStatus !== 'inEscrow' && ticket.saleStatus !== 'sold') && <p className='text-xs font-medium font-poppins text-[#ff0000]'>Event Ended</p>}
                        </div>
                    ) : isBundle(ticket) ? (
                        <div className='flex gap-2 w-full'>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
            <Dialog open={loading}>
                <DialogContent className='flex items-center justify-center bg-transparent border-none outline-none'>
                    <Loader2 className='animate-spin' size={42} color="#5E1F3C" />
                </DialogContent>
            </Dialog>
        </>
    )
}