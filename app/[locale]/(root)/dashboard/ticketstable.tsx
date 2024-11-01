import FiltersTicketsTable from "@/components/shared/FiltersTicketsTable"
import SearchBarTicketsTable from "@/components/shared/SearchBarTicketsTable"
import TicketRowContainer from "@/components/shared/TicketRowContainer"
import { initAdmin } from "@/firebase/server/config"
import { TicketType, Bundle, TicketOrBundle } from "@/lib/types/ticketTypes"
import { initTranslations } from "@/lib/utils"
import Link from "next/link"

type Props = {
    ticketsForSale: TicketType[]
    bundlesForSale: Bundle[]
    search?: string
    filter?: string
    locale?: string | undefined
}

export default async function TicketsTable({ ticketsForSale, bundlesForSale, search, filter, locale }: Props)
{
    const { t } = await initTranslations(locale!, ['homepage'])

    const individualTickets = ticketsForSale.filter(ticket => ticket.salePrice).map(ticket => ({ ...ticket, type: 'individual' }))
    const bundles = bundlesForSale.filter(bundle => bundle.price).map(bundle => ({ ...bundle, type: 'bundle' }))

    const displayedTickets = [...individualTickets, ...bundles].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    return (
        <section className='flex flex-col relative flex-1 items-center justify-start mt-16 gap-8 w-full overflow-hidden'>
            <div className='flex w-full max-w-full items-center justify-between gap-4 max-lg:flex-col'>
                <Link href='/dashboard?tab=requests' className='bg-[#E72377] rounded-[4px] font-light py-3 flex-1 text-sm max-w-[160px] w-screen px-6 text-white font-poppins'>{t("buyerRequests")}</Link>
                <div className='flex gap-4 items-center justify-center max-w-full'>
                    <SearchBarTicketsTable tab={undefined} search={search} filter={filter} />
                    <FiltersTicketsTable tab={undefined} search={search} filter={filter} />
                </div>
            </div>
            <div className="flex w-full overflow-auto">
                <div className='flex flex-col gap-2 w-full flex-1 overflow-auto relative min-w-[960px]'>
                    <div className='flex w-full sticky top-0 items-center justify-between bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] rounded-lg'>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>{t("event")}</div>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>{t("ticketCategory")}</div>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>{t("type")}</div>
                        <div className='flex-[0.333333] py-6 font-medium text-xs text-white text-center font-poppins'>{t("quantity")}</div>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>{t("status")}</div>
                    </div>
                    <div className='flex flex-col gap-2 w-full'>
                        {displayedTickets.map(ticket => <TicketRowContainer locale={locale} key={ticket.id} ticket={ticket as TicketOrBundle} search={search} filter={filter} />)}
                    </div>
                </div>
            </div>
        </section>
    )
}