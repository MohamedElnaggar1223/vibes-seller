import FiltersTicketsTable from "@/components/shared/FiltersTicketsTable"
import SearchBarTicketsTable from "@/components/shared/SearchBarTicketsTable"
import TicketRowContainer from "@/components/shared/TicketRowContainer"
import { initAdmin } from "@/firebase/server/config"
import { TicketType, Bundle, TicketOrBundle } from "@/lib/types/ticketTypes"
import Link from "next/link"

type Props = {
    ticketsForSale: TicketType[]
    bundlesForSale: Bundle[]
    search?: string
    filter?: string
}

export default async function TicketsTable({ ticketsForSale, bundlesForSale, search, filter }: Props)
{
    const individualTickets = ticketsForSale.filter(ticket => ticket.salePrice).map(ticket => ({ ...ticket, type: 'individual' }))
    const bundles = bundlesForSale.filter(bundle => bundle.price).map(bundle => ({ ...bundle, type: 'bundle' }))

    const displayedTickets = [...individualTickets, ...bundles].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    return (
        <section className='flex flex-col relative flex-1 items-center justify-start mt-16 gap-8 w-full overflow-hidden'>
            <div className='flex w-full items-center justify-between gap-4'>
                <Link href='/dashboard?tab=requests' className='bg-[#E72377] rounded-[4px] font-light py-3 flex-1 text-sm max-w-[160px] w-screen px-6 text-white font-poppins'>Buyer Requests</Link>
                <div className='flex gap-4 items-center justify-center'>
                    <SearchBarTicketsTable search={search} filter={filter} />
                    <FiltersTicketsTable search={search} filter={filter} />
                </div>
            </div>
            <div className='flex flex-col gap-2 w-full flex-1 overflow-auto relative'>
                <div className='flex w-full sticky top-0 items-center justify-between bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] rounded-lg'>
                    <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>Event</div>
                    <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>Ticket Category</div>
                    <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>Type</div>
                    <div className='flex-[0.333333] py-6 font-medium text-xs text-white text-center font-poppins'>Quantity</div>
                    <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>Status</div>
                </div>
                <div className='flex flex-col gap-2 w-full'>
                    {displayedTickets.map(ticket => <TicketRowContainer key={ticket.id} ticket={ticket as TicketOrBundle} search={search} filter={filter} />)}
                </div>
            </div>
        </section>
    )
}