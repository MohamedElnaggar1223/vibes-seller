import FormattedPrice from "@/components/shared/FormattedPrice";
import { initAdmin } from "@/firebase/server/config";
import { ExchangeRate } from "@/lib/types/eventTypes";
import { DigitalProduct } from "@/lib/types/digitalProductTypes";
import { UserType } from "@/lib/types/userTypes";

type Props = {
    exchangeRate: ExchangeRate
    user: UserType
    locale: string | undefined
}

export default async function DigitalProductReservationsCards({ exchangeRate, user, locale }: Props)
{
    const admin = await initAdmin()
    
    const digitalProductsCollection = admin.firestore().collection('digitalProducts')

    const userDigitalProductsListings = (await digitalProductsCollection.where('userId', '==', user.id).get()).docs.map(doc => ({...doc.data(), id: doc.id})) as unknown as DigitalProduct[]

    const totalDigitalProducts = userDigitalProductsListings.length

    const soldDigitalProducts = userDigitalProductsListings.filter((doc) => doc.status === 'sold')
    const totalDigitalProductsSold = soldDigitalProducts.length

    const digitalProductsOnSale = userDigitalProductsListings.filter((doc) => doc.status === 'onSale')
    const totalDigitalProductsOnSale = digitalProductsOnSale.length

    const totalRevenue = soldDigitalProducts.reduce((acc, doc) => {
        const ticketCountry = doc.currency
        const ticketPrice = (typeof doc.price === 'string' ? parseFloat(doc.price) : doc.price!)
        return acc + (ticketCountry === 'EGP' ? ticketPrice / exchangeRate.USDToEGP : ticketCountry === 'SAR' ? ticketPrice / exchangeRate.USDToSAR : ticketPrice / exchangeRate.USDToAED)
    }, 0)

    const totalInEscrow = userDigitalProductsListings.filter((doc) => doc.status === 'inEscrow').reduce((acc, doc) => {
        const ticketCountry = doc.currency
        const ticketPrice = (typeof doc.price === 'string' ? parseFloat(doc.price) : doc.price!)
        return acc + (ticketCountry === 'EGP' ? ticketPrice / exchangeRate.USDToEGP : ticketCountry === 'SAR' ? ticketPrice / exchangeRate.USDToSAR : ticketPrice / exchangeRate.USDToAED)
    }, 0)

    return (
        <div className='flex flex-wrap gap-8 items-center justify-between w-full max-md:justify-center'>
            <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                <div className="flex flex-col text-left items-start justify-center gap-2">
                    <p className='text-xs text-nowrap font-poppins font-medium'>{locale === 'ar' ? "إجمالي الإيرادات" : 'Total Revenue'}</p>
                    <p className='text-md font-poppins font-medium'><FormattedPrice price={totalRevenue} exchangeRate={exchangeRate} /></p>
                </div>
            </div>
            <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                <div className="flex flex-col text-left items-start justify-center gap-2">
                    <p className='text-xs text-nowrap font-poppins font-medium'>{locale === 'ar' ? "إجمالي المبيعات" : 'Total Sales'}</p>
                    <p className='text-md font-poppins font-medium'>{totalDigitalProductsSold} <span className='text-[#666666]'>{locale === 'ar' ? "مبيعات" : 'sales'}</span></p>
                </div>
            </div>
            <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                <div className="flex flex-col text-left items-start justify-center gap-2">
                    <p className='text-xs text-nowrap font-poppins font-medium'>{locale === 'ar' ? "المبيعات المشترية" : 'Listings on Sale'}</p>
                    <p className='text-md font-poppins font-medium'>{totalDigitalProductsOnSale} <span className='text-[#666666]'>{locale === 'ar' ? "قوائم" : 'listings'}</span></p>
                </div>
            </div>
            <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                <div className="flex flex-col text-left items-start justify-center gap-2">
                    <p className='text-xs text-nowrap font-poppins font-medium'>{locale === 'ar' ? "إجمالي القوائم" : 'Total Listings'}</p>
                    <p className='text-md font-poppins font-medium'>{totalDigitalProducts} <span className='text-[#666666]'>{locale === 'ar' ? "قوائم" : 'listings'}</span></p>
                </div>
            </div>
            <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                <div className="flex flex-col text-left items-start justify-center gap-2">
                    <p className='text-xs text-nowrap font-poppins font-medium'>{locale === 'ar' ? "المال في الضمان" : 'Money in Escrow'}</p>
                    <p className='text-md font-poppins font-medium'><FormattedPrice price={totalInEscrow} exchangeRate={exchangeRate} /></p>
                </div>
            </div>
        </div>
    )
}