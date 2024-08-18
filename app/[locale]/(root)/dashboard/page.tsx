import FormattedPrice from "@/components/shared/FormattedPrice"
import { initAdmin } from "@/firebase/server/config"
import { getExchangeRate } from "@/lib/utils"
import { getUser } from "../layout"
import { Bundle, TicketType } from "@/lib/types/ticketTypes"
import TicketsTable from "./ticketstable"
import BuyerRequests from "./buyerrequests"

type Props = {
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function DashboardPage({ searchParams }: Props)
{
    const tab = typeof searchParams.tab === 'string' ? searchParams.tab : 'tickets'
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
    const filter = typeof searchParams.filter === 'string' ? searchParams.filter : undefined

    const admin = await initAdmin()

    const user = await getUser()

    const ticketsCollection = admin.firestore().collection('tickets')
    const bundlesCollection = admin.firestore().collection('bundles')

    const ticketsForSale = (await ticketsCollection.where('forSale', '==', true).where('saleStatus', '!=', null).where('userId', '==', user?.id).get()).docs.map(doc => ({...doc.data(), createdAt: doc.data()?.createdAt.toDate()})) as TicketType[]
    const bundlesForSale = (await bundlesCollection.where('userId', '==', user?.id).get()).docs.map(doc => ({...doc.data(), id: doc.id, createdAt: doc.data()?.createdAt.toDate()})) as Bundle[]
    const ticketsSold = ticketsForSale.filter((doc) => doc.saleStatus === 'sold')
    
    let totalRevenue = ticketsSold.reduce((acc, doc) => acc + (typeof doc.salePrice === 'string' ? parseFloat(doc.salePrice) : doc.salePrice!), 0)
    let totalTicketsSold = ticketsSold.length
    let totalTicketsForSale = ticketsForSale.length
    let totalTicketsOnSale = ticketsForSale.filter((doc) => doc.saleStatus === 'onSale').length
    let totalAmountInEscrow = ticketsForSale.filter((doc) => doc.saleStatus === 'inEscrow').reduce((acc, doc) => acc + (typeof doc.salePrice === 'string' ? parseFloat(doc.salePrice) : doc.salePrice!), 0)

    totalTicketsSold += bundlesForSale.filter((doc) => doc.status === 'sold').map((doc) => doc.tickets.length).reduce((acc, curr) => acc + curr, 0)
    totalRevenue += bundlesForSale.filter((doc) => doc.status === 'sold').map((doc) => doc.price).reduce((acc, curr) => acc + curr, 0)
    totalTicketsForSale += bundlesForSale.map((doc) => doc.tickets.length).reduce((acc, curr) => acc + curr, 0)
    totalTicketsOnSale += bundlesForSale.filter((doc) => doc.status === 'onSale').reduce((acc, curr) => acc + curr.tickets.length, 0)
    totalAmountInEscrow += bundlesForSale.filter((doc) => doc.status === 'inEscrow').map((doc) => doc.price).reduce((acc, curr) => acc + curr, 0)

    const exchangeRate = await getExchangeRate()

    return (
        <section className='flex flex-col relative flex-1 items-center justify-start p-12 gap-8 max-h-screen'>
            <header className='py-4 flex gap-4 items-center justify-center w-full'>
                <button type="submit" className='rounded-[4px] font-light py-2 flex-1 max-w-[197px] w-screen px-2 bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] text-white font-poppins'>Tickets</button>
                <button disabled type="submit" className='rounded-[4px] font-light py-2 flex-1 max-w-[197px] w-screen px-2 bg-gradient-to-r opacity-65 bg-white text-black font-poppins'>Digital Products</button>
                <button disabled type="submit" className='rounded-[4px] font-light py-2 flex-1 max-w-[197px] w-screen px-2 bg-gradient-to-r opacity-65 bg-white text-black font-poppins'>Hotel Reservations</button>
            </header>
            <div className='flex flex-wrap gap-8 items-center justify-between w-full'>
                <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                    <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                    <div className="flex flex-col text-left items-start justify-center gap-2">
                        <p className='text-xs text-nowrap font-poppins font-medium'>Total Revenue</p>
                        <p className='text-md font-poppins font-medium'><FormattedPrice price={totalRevenue} exchangeRate={exchangeRate} /></p>
                    </div>
                </div>
                <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                    <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                    <div className="flex flex-col text-left items-start justify-center gap-2">
                        <p className='text-xs text-nowrap font-poppins font-medium'>Total Sales</p>
                        <p className='text-md font-poppins font-medium'>{totalTicketsSold} <span className='text-[#666666]'>tickets</span></p>
                    </div>
                </div>
                <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                    <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                    <div className="flex flex-col text-left items-start justify-center gap-2">
                        <p className='text-xs text-nowrap font-poppins font-medium'>Total Tickets</p>
                        <p className='text-md font-poppins font-medium'>{totalTicketsForSale} <span className='text-[#666666]'>tickets</span></p>
                    </div>
                </div>
                <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                    <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                    <div className="flex flex-col text-left items-start justify-center gap-2">
                        <p className='text-xs text-nowrap font-poppins font-medium'>Tickets on sale</p>
                        <p className='text-md font-poppins font-medium'>{totalTicketsOnSale} <span className='text-[#666666]'>tickets</span></p>
                    </div>
                </div>
                <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                    <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                    <div className="flex flex-col text-left items-start justify-center gap-2">
                        <p className='text-xs text-nowrap font-poppins font-medium'>Money in Escrow</p>
                        <p className='text-md font-poppins font-medium'><FormattedPrice price={totalAmountInEscrow} exchangeRate={exchangeRate} /></p>
                    </div>
                </div>
            </div>
            {tab === 'tickets' ? <TicketsTable ticketsForSale={ticketsForSale} bundlesForSale={bundlesForSale} search={search} filter={filter} /> : <BuyerRequests />}
        </section>
    )
}