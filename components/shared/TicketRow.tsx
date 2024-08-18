import { TicketType, Bundle, TicketOrBundle } from "@/lib/types/ticketTypes"
import { cn, getEvent } from "@/lib/utils"
import Image from "next/image"

// type ItemType<T extends { type: string }> = T['type'] extends 'individual'
//     ? TicketType
//     : T['type'] extends 'bundle'
//     ? Bundle
//     : never;

function isTicket(item: TicketOrBundle): item is TicketType & { type: 'individual' } {
    return item.type === 'individual'
}

function isBundle(item: TicketOrBundle): item is Bundle & { type: 'bundle' } {
    return item.type === 'bundle'
}

type Props = {
    ticket: TicketOrBundle
    search: string | undefined
    filter: string | undefined
    // ticket: ItemType<{ type: 'individual' | 'bundle' }>
}

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

export default async function TicketRow({ ticket, search, filter }: Props)
{
    const event = await getEvent(ticket.eventId)

    if(!event) return null
    if(search && !event.name.toLowerCase().includes(search?.toLowerCase()!)) return null
    if(filter && isTicket(ticket) && ticket.saleStatus !== filter) return null
    if(filter && isBundle(ticket) && ticket.status !== filter) return null

    return (
        <div className='flex w-full items-center justify-between rounded-lg'>
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
                    <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins rounded-tr-lg rounded-br-lg', statusOptions[ticket.saleStatus!].bg, statusOptions[ticket.saleStatus!].color)}>{statusOptions[ticket.saleStatus!].text}</div>
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
                    <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins rounded-tr-lg rounded-br-lg', statusOptions[ticket.status!].bg, statusOptions[ticket.status!].color)}>{statusOptions[ticket.status!].text}</div>
                </>
            ) : null}
        </div>
    )
}