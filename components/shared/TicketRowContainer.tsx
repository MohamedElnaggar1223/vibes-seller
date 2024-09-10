import { getEvent, getTicket } from "@/lib/utils";
import TicketRow from "./TicketRow";
import { TicketOrBundle, TicketType, Bundle } from "@/lib/types/ticketTypes";

type Props = {
    ticket: TicketOrBundle
    search: string | undefined
    filter: string | undefined
    // ticket: ItemType<{ type: 'individual' | 'bundle' }>
}

export function isTicket(item: TicketOrBundle): item is TicketType & { type: 'individual' } {
    return item.type === 'individual'
}

export function isBundle(item: TicketOrBundle): item is Bundle & { type: 'bundle' } {
    return item.type === 'bundle'
}

export default async function TicketRowContainer({ ticket, search, filter }: Props) 
{
    const event = await getEvent(ticket.eventId)

    if(!event) return null
    if(search && !event.name.toLowerCase().includes(search?.toLowerCase()!)) return null
    if(filter && isTicket(ticket) && ticket.saleStatus !== filter) return null
    if(filter && isBundle(ticket) && ticket.status !== filter) return null

    let bundleTickets
    if(isBundle(ticket)) bundleTickets = await Promise.all(Object.values(ticket.tickets).map(async (ticketKey) => {
        const ticketData = await getTicket(ticketKey)
        return {...ticketData, type: 'individual'}
    }))

    return <TicketRow event={event} ticket={ticket} bundleTickets={bundleTickets} />
}