import { getUser } from "@/app/[locale]/(root)/layout"
import { initAdmin } from "@/firebase/server/config"
import { TicketType } from "@/lib/types/ticketTypes"
import UserTicketsTable from "./UserTicketsTable"
import { getEvent } from "@/lib/utils"

type Props = {
    eventId: string
}

export default async function UserTickets({ eventId }: Props)
{
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
        <div className='relative flex flex-col gap-4 w-full'>
            {userEventTickets.length > 0 && (
                <div className='flex px-4 items-center justify-between'>
                    <p className='font-poppins text-xs lg:text-md font-extralight text-white'>Please Select the tickets you want to sell</p>
                    <p className='font-poppins text-xs lg:text-md font-normal text-white'>Showing a total of ({userEventTickets?.length}) Tickets</p>
                </div>
            )}
            <UserTicketsTable user={user!} tickets={userEventTickets} event={event!} />
        </div>
    )
}