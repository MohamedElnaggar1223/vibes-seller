import FiltersHotelReservationsTable from "@/components/shared/FiltersTicketsTable"
import SearchBarHotelReservationsTable from "@/components/shared/SearchBarTicketsTable"
import HotelRowContainer from "@/components/shared/HotelRowContainer"
import { initAdmin } from "@/firebase/server/config"
import { Hotel } from "@/lib/types/hotelTypes"
import { UserType } from "@/lib/types/userTypes"
import Link from "next/link"
import { ExchangeRate } from "@/lib/types/eventTypes"

type Props = {
    user: UserType
    exchangeRate: ExchangeRate
    locale: string | undefined
    search?: string
    filter?: string
}

export default async function HotelReservationsTable({ search, filter, user, exchangeRate, locale }: Props) {
    const admin = await initAdmin()

    const hotelsCollection = admin.firestore().collection('hotels')

    const userHotelsListings = (await hotelsCollection.where('userId', '==', user.id).get()).docs.map(doc => ({ ...doc.data(), id: doc.id, date: { from: doc.data().date.from.toDate(), to: doc.data().date.to.toDate() } })) as unknown as Hotel[]

    return (
        <section className='flex flex-col relative flex-1 items-center justify-start mt-16 gap-8 w-full overflow-auto min-h-[400px]'>
            <div className='flex w-full items-center justify-between gap-4'>
                <div className='flex gap-4 items-center justify-center ml-auto'>
                    <SearchBarHotelReservationsTable tab='hotel-reservations' search={search} filter={filter} />
                    <FiltersHotelReservationsTable tab='hotel-reservations' search={search} filter={filter} />
                </div>
            </div>
            <div className="flex w-full overflow-auto">
                <div className='flex flex-col gap-2 w-full flex-1 overflow-auto relative min-w-[960px]'>
                    <div className='flex w-full sticky top-0 items-center justify-between bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] rounded-lg'>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>{locale === 'ar' ? "الفندق" : 'Hotel'}</div>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>{locale === 'ar' ? "نوع الغرفة" : 'Room & Board Type'}</div>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>{locale === 'ar' ? "الدخول - الخروج" : 'Check In-Check Out'}</div>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>{locale === 'ar' ? "رقم المقعد" : 'Itenirary Number'}</div>
                        <div className='flex-[0.45] py-6 font-medium text-xs text-white text-center font-poppins'>{locale === 'ar' ? "السعر" : 'Price'}</div>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>{locale === 'ar' ? "الحالة" : 'Status'}</div>
                    </div>
                    <div className='flex flex-col gap-2 w-full'>
                        {userHotelsListings.map(hotel => <HotelRowContainer exchangeRate={exchangeRate} key={hotel.id} hotel={hotel} search={search} filter={filter} />)}
                    </div>
                </div>
            </div>
        </section>
    )
}