import FormattedPrice from "@/components/shared/FormattedPrice"
import { ExchangeRate } from "@/lib/types/eventTypes"

type Props = {
    totalRevenue: number
    totalTicketsSold: number
    totalTicketsForSale: number
    totalTicketsOnSale: number
    totalAmountInEscrow: number
    exchangeRate: ExchangeRate
}

export default function TicketsCards({ exchangeRate, totalAmountInEscrow, totalRevenue, totalTicketsForSale, totalTicketsOnSale, totalTicketsSold }: Props)
{
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
    )
}