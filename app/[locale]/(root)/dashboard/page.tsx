import TicketsTable from "./ticketstable"
import BuyerRequests from "./buyerrequests"
import Link from "next/link"
import TicketsCards from "./tickets-cards"
import { cn, initTranslations } from "@/lib/utils"
import { initAdmin } from "@/firebase/server/config"
import { getExchangeRate } from "@/lib/utils"
import { getUser } from "../layout"
import { Bundle, TicketType } from "@/lib/types/ticketTypes"
import HotelReservationsCards from "./hotel-reservations-cards"
import HotelReservationsTable from "./hotel-reservations-table"
import DigitalProductReservationsCards from "./digital-products-cards"
import DigitalProductsTable from "./digital-products-table"

type Props = {
    searchParams: { [key: string]: string | string[] | undefined }
    params: { locale?: string | undefined }
}

export default async function DashboardPage({ searchParams, params }: Props) {
    const { t } = await initTranslations(params.locale!, ['homepage'])

    const tab = typeof searchParams.tab === 'string' ? searchParams.tab : 'tickets'
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
    const filter = typeof searchParams.filter === 'string' ? searchParams.filter : undefined

    const admin = await initAdmin()

    const user = await getUser()

    const exchangeRate = await getExchangeRate()

    const ticketsCollection = admin.firestore().collection('tickets')
    const bundlesCollection = admin.firestore().collection('bundles')

    const ticketsForSale = (await ticketsCollection.where('forSale', '==', true).where('saleStatus', '!=', null).where('userId', '==', user?.id).get()).docs.map(doc => ({ ...doc.data(), createdAt: doc.data()?.createdAt.toDate() })) as TicketType[]
    const bundlesForSale = (await bundlesCollection.where('userId', '==', user?.id).get()).docs.map(doc => ({ ...doc.data(), id: doc.id, createdAt: doc.data()?.createdAt.toDate() })) as Bundle[]
    const ticketsSold = ticketsForSale.filter((doc) => doc.saleStatus === 'sold')
    const bundlesWithTickets = await Promise.all(bundlesForSale.map(async (bundle) => {
        const tickets = await ticketsCollection.where('bundleID', '==', bundle.id).where('userId', '!=', user?.id ?? '').get()
        return { ...bundle, tickets: tickets.docs.map(doc => ({ ...doc.data(), id: doc.id, createdAt: doc.data()?.createdAt.toDate() })) as TicketType[] }
    }))

    let totalRevenue = ticketsSold.reduce((acc, doc) => {
        const ticketCountry = doc.country
        const ticketPrice = (typeof doc.salePrice === 'string' ? parseFloat(doc.salePrice) : doc.salePrice!)
        return acc + (ticketCountry === 'EGP' ? ticketPrice / exchangeRate.USDToEGP : ticketCountry === 'SAR' ? ticketPrice / exchangeRate.USDToSAR : ticketPrice / exchangeRate.USDToAED)
    }, 0)
    let totalTicketsSold = ticketsSold.length
    let totalTicketsForSale = ticketsForSale.length
    let totalTicketsOnSale = ticketsForSale.filter((doc) => doc.saleStatus === 'onSale').length
    let totalAmountInEscrow = ticketsForSale.filter((doc) => doc.saleStatus === 'inEscrow').reduce((acc, doc) => {
        const ticketCountry = doc.country
        const ticketPrice = (typeof doc.salePrice === 'string' ? parseFloat(doc.salePrice) : doc.salePrice!)
        return acc + (ticketCountry === 'EGP' ? ticketPrice / exchangeRate.USDToEGP : ticketCountry === 'SAR' ? ticketPrice / exchangeRate.USDToSAR : ticketPrice / exchangeRate.USDToAED)
    }, 0)

    totalTicketsSold += bundlesForSale.filter((doc) => doc.status === 'sold').map((doc) => doc.tickets.length).reduce((acc, curr) => acc + curr, 0)
    totalRevenue += bundlesWithTickets.filter((doc) => doc.status === 'sold').reduce((acc, curr) => {
        const ticketCountry = curr.tickets[0].country
        const ticketPrice = typeof curr.price === 'string' ? parseFloat(curr.price) : curr.price
        return acc + (ticketCountry === 'EGP' ? ticketPrice / exchangeRate.USDToEGP : ticketCountry === 'SAR' ? ticketPrice / exchangeRate.USDToSAR : ticketPrice / exchangeRate.USDToAED)
    }, 0)
    totalTicketsForSale += bundlesForSale.map((doc) => doc.tickets.length).reduce((acc, curr) => acc + curr, 0)
    totalTicketsOnSale += bundlesForSale.filter((doc) => doc.status === 'onSale').reduce((acc, curr) => acc + curr.tickets.length, 0)
    totalAmountInEscrow += bundlesWithTickets.filter((doc) => doc.status === 'inEscrow').reduce((acc, curr) => {
        const ticketCountry = curr.tickets[0].country
        const ticketPrice = typeof curr.price === 'string' ? parseFloat(curr.price) : curr.price
        return acc + (ticketCountry === 'EGP' ? ticketPrice / exchangeRate.USDToEGP : ticketCountry === 'SAR' ? ticketPrice / exchangeRate.USDToSAR : ticketPrice / exchangeRate.USDToAED)
    }, 0)

    return (
        <section className='flex flex-col relative flex-1 items-center justify-start p-4 md:p-12 gap-8 md:max-h-screen overflow-auto'>
            <header className='py-4 flex gap-4 items-center justify-center w-full max-md:flex-col'>
                <Link href='/dashboard' className={cn('rounded-[4px] font-light py-2 flex-1 max-w-[197px] w-screen px-2 font-poppins text-center flex items-center justify-center', (tab !== 'hotel-reservations' && tab !== 'digital-products') ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] text-white' : 'bg-white text-black')}>{t("tickets")}</Link>
                <Link href='/dashboard?tab=digital-products' className={cn('rounded-[4px] font-light py-2 flex-1 max-w-[197px] w-screen px-2 font-poppins text-center flex items-center justify-center', tab === 'digital-products' ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] text-white' : 'bg-white text-black')}>{t("digitalProducts")}</Link>
                <Link href='/dashboard?tab=hotel-reservations' className={cn('rounded-[4px] font-light py-2 flex-1 max-w-[197px] w-screen px-2 font-poppins text-center flex items-center justify-center', tab === 'hotel-reservations' ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] text-white' : 'bg-white text-black')}>{t("hotelReservations")}</Link>
            </header>
            {tab === 'hotel-reservations' ? <HotelReservationsCards locale={params.locale} user={user!} exchangeRate={exchangeRate} /> : tab === 'digital-products' ? <DigitalProductReservationsCards locale={params.locale} exchangeRate={exchangeRate} user={user!} /> : <TicketsCards locale={params.locale} exchangeRate={exchangeRate} totalAmountInEscrow={totalAmountInEscrow} totalRevenue={totalRevenue} totalTicketsForSale={totalTicketsForSale} totalTicketsOnSale={totalTicketsOnSale} totalTicketsSold={totalTicketsSold} />}
            {tab === 'requests' ? <BuyerRequests locale={params.locale} /> : tab === 'hotel-reservations' ? <HotelReservationsTable locale={params.locale} user={user!} exchangeRate={exchangeRate} search={search} filter={filter} /> : tab === 'digital-products' ? <DigitalProductsTable locale={params.locale} exchangeRate={exchangeRate} user={user!} search={search} filter={filter} /> : <TicketsTable locale={params.locale} ticketsForSale={ticketsForSale} bundlesForSale={bundlesForSale} search={search} filter={filter} />}
        </section>
    )
}