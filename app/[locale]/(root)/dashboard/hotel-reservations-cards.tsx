import FormattedPrice from "@/components/shared/FormattedPrice";
import { initAdmin } from "@/firebase/server/config";
import { ExchangeRate } from "@/lib/types/eventTypes";
import { Hotel } from "@/lib/types/hotelTypes";
import { UserType } from "@/lib/types/userTypes";

type Props = {
    exchangeRate: ExchangeRate
    user: UserType
}

export default async function HotelReservationsCards({ exchangeRate, user }: Props) 
{
    const admin = await initAdmin()
    
    const hotelsCollection = admin.firestore().collection('hotels')

    const userHotelsListings = (await hotelsCollection.where('userId', '==', user.id).get()).docs.map(doc => ({...doc.data(), id: doc.id})) as unknown as Hotel[]

    const totalHotels = userHotelsListings.length

    const soldHotels = userHotelsListings.filter((doc) => doc.status === 'sold')
    const totalHotelsSold = soldHotels.length

    const hotelsOnSale = userHotelsListings.filter((doc) => doc.status === 'onSale')
    const totalHotelsOnSale = hotelsOnSale.length

    const totalRevenue = soldHotels.reduce((acc, doc) => {
        const ticketCountry = doc.country
        const ticketPrice = (typeof doc.price === 'string' ? parseFloat(doc.price) : doc.price!)
        return acc + (ticketCountry === 'EGP' ? ticketPrice / exchangeRate.USDToEGP : ticketCountry === 'SAR' ? ticketPrice / exchangeRate.USDToSAR : ticketPrice / exchangeRate.USDToAED)
    }, 0)

    return (
        <div className='flex flex-wrap gap-8 items-center justify-between w-full max-md:justify-center'>
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
                    <p className='text-md font-poppins font-medium'>{totalHotelsSold} <span className='text-[#666666]'>sales</span></p>
                </div>
            </div>
            <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                <div className="flex flex-col text-left items-start justify-center gap-2">
                    <p className='text-xs text-nowrap font-poppins font-medium'>Listings on Sale</p>
                    <p className='text-md font-poppins font-medium'>{totalHotelsOnSale} <span className='text-[#666666]'>listings</span></p>
                </div>
            </div>
            <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                <div className="flex flex-col text-left items-start justify-center gap-2">
                    <p className='text-xs text-nowrap font-poppins font-medium'>Total Listings</p>
                    <p className='text-md font-poppins font-medium'>{totalHotels} <span className='text-[#666666]'>listings</span></p>
                </div>
            </div>
        </div>
    )
}