import { getUser } from "@/app/[locale]/(root)/layout"
import { initAdmin } from "@/firebase/server/config"
import { TicketType } from "@/lib/types/ticketTypes"
import UserTicketsTable from "./UserTicketsTable"
import { getEvent, initTranslations, toArabicNums } from "@/lib/utils"

type Props = {
    eventId: string
    locale?: string | undefined
}

export default async function UserTickets({ eventId, locale }: Props)
{
    const { t } = await initTranslations(locale!, ['homepage', 'common'])

    const user = await getUser()

    const admin = await initAdmin()

    const userTickets = user?.tickets?.map(async (ticket) => {
        const ticketData = await admin.firestore().collection('tickets').doc(ticket).get()
        return {...ticketData.data(), createdAt: ticketData.data()?.createdAt.toDate()} as TicketType
    })

    const finalUserTickets = await Promise.all(userTickets!)

    const event = await getEvent(eventId)
    
    const userEventTickets = finalUserTickets?.filter((ticket) => ticket?.eventId === eventId && !ticket.forSale)

    return (
        <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className='relative flex flex-col gap-4 w-full'>
            {userEventTickets.length > 0 && (
                <div className='flex px-4 items-center justify-between'>
                    <p className='font-poppins text-xs lg:text-md font-extralight text-white'>{t("pleaseSelect")}</p>
                    <p className='font-poppins text-xs lg:text-md font-normal text-white'>{t("showingTotal")} ({locale === 'ar' ? toArabicNums(userEventTickets?.length.toString() ?? '0') : userEventTickets?.length}) {t("tickets")}</p>
                </div>
            )}
            <UserTicketsTable user={user!} tickets={userEventTickets} event={event!} locale={locale} />
        </div>
    )
}