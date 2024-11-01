import FormattedPrice from "@/components/shared/FormattedPrice"
import { ExchangeRate } from "@/lib/types/eventTypes"
import { initTranslations, toArabicNums } from "@/lib/utils"

type Props = {
    totalRevenue: number
    totalTicketsSold: number
    totalTicketsForSale: number
    totalTicketsOnSale: number
    totalAmountInEscrow: number
    exchangeRate: ExchangeRate
    locale?: string | undefined
}

export default async function TicketsCards({ locale, exchangeRate, totalAmountInEscrow, totalRevenue, totalTicketsForSale, totalTicketsOnSale, totalTicketsSold }: Props)
{
    const { t } = await initTranslations(locale!, ['homepage'])

    return (
        <div className='flex flex-wrap gap-8 items-center justify-between w-full max-md:justify-center'>
            <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                <div className="flex flex-col text-left items-start justify-center gap-2">
                    <p className='text-xs text-nowrap font-poppins font-medium'>{t("totalRevenue")}</p>
                    <p className='text-md font-poppins font-medium'><FormattedPrice price={totalRevenue} exchangeRate={exchangeRate} /></p>
                </div>
            </div>
            <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                <div className="flex flex-col text-left items-start justify-center gap-2">
                    <p className='text-xs text-nowrap font-poppins font-medium'>{t("totalSales")}</p>
                    <p className='text-md font-poppins font-medium'>{locale === 'ar' ? toArabicNums(totalTicketsSold.toString()) : totalTicketsSold} <span className='text-[#666666]'>{t("tickets")}</span></p>
                </div>
            </div>
            <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                <div className="flex flex-col text-left items-start justify-center gap-2">
                    <p className='text-xs text-nowrap font-poppins font-medium'>{t("totalTickets")}</p>
                    <p className='text-md font-poppins font-medium'>{locale === 'ar' ? toArabicNums(totalTicketsForSale.toString()) : totalTicketsForSale} <span className='text-[#666666]'>{t("tickets")}</span></p>
                </div>
            </div>
            <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                <div className="flex flex-col text-left items-start justify-center gap-2">
                    <p className='text-xs text-nowrap font-poppins font-medium'>{t("ticketsOnSale")}</p>
                    <p className='text-md font-poppins font-medium'>{locale === 'ar' ? toArabicNums(totalTicketsOnSale.toString()) : totalTicketsOnSale} <span className='text-[#666666]'>{t("tickets")}</span></p>
                </div>
            </div>
            <div className="flex items-center justify-start pl-4 pr-2 py-1 bg-white gap-4 rounded-[10px] w-[160px] h-[71px]">
                <div className='h-full w-[4px] rounded-3xl bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' />
                <div className="flex flex-col text-left items-start justify-center gap-2">
                    <p className='text-xs text-nowrap font-poppins font-medium'>{t("moneyInEscrow")}</p>
                    <p className='text-md font-poppins font-medium'><FormattedPrice price={totalAmountInEscrow} exchangeRate={exchangeRate} /></p>
                </div>
            </div>
        </div>
    )
}