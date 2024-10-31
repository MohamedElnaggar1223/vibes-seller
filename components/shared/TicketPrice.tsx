import { TicketType } from "@/lib/types/ticketTypes"
import { cn, toArabicNums } from "@/lib/utils"
import { memo } from "react"
import { useTranslation } from "react-i18next"

type Props = { 
    ticket: TicketType & { salePrice: string }, 
    setTicketsSelectedWithPrice: React.Dispatch<React.SetStateAction<(TicketType & { salePrice: string })[]>> 
    index: number
    arabicTicketNames: { [key: string]: string }
    locale?: string | undefined
}

const TicketPrice = ({ ticket, setTicketsSelectedWithPrice, index, arabicTicketNames, locale }: Props) => {
    const { t } = useTranslation()
    
    return (
        <div key={ticket.id} className='flex items-center justify-center flex-col gap-2 w-full mb-4'>
            <div className='flex pl-6 pr-12 py-1 items-center justify-between bg-black w-full'>
                <p className={cn('rounded-full text-sm h-7 w-7 text-white flex items-center justify-center text-center font-poppins', parseInt(ticket.salePrice) ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'bg-[#D9D9D9]')}>{locale === 'ar' ? toArabicNums((index + 1).toString()) : index + 1}</p>
                <p className='font-poppins text-sm w-20 text-center text-white'>{t("price")}</p>
            </div>
            <div className='flex pl-6 pr-12 items-center justify-between w-full'>
                <p className='font-poppins text-sm font-medium text-black'>{locale === 'ar' ? arabicTicketNames[Object.keys(ticket.tickets)[0]] : Object.keys(ticket.tickets)[0]}</p>
                <input value={ticket.salePrice} onChange={(e) => setTicketsSelectedWithPrice(prev => /^-?\d+(\.\d+)?$/.test(e.target.value) ? prev.map(ticketDoc => ticketDoc.id === ticket.id ? ({...ticket, salePrice: e.target.value}) as TicketType & { salePrice: string } : ticketDoc as TicketType & { salePrice: string }) : prev)} placeholder="0.00 EGP" className='bg-[#1E1E1E] rounded-sm w-20 text-center h-7 text-white font-poppins text-sm font-normal' />
            </div>
        </div>
    )
}

const memoizedTicketPrice = memo(TicketPrice)

export default memoizedTicketPrice