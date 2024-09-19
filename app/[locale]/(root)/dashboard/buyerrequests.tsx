import { initAdmin } from "@/firebase/server/config"
import { Bundle, TicketType } from "@/lib/types/ticketTypes"
import { UserType } from "@/lib/types/userTypes"
import { getEvent } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import UploadProofButton from "./upload-proof-button"

export default async function BuyerRequests()
{
    const admin = await initAdmin()

    const ticketRequests = (await admin.firestore().collection('tickets').where('requested', '==', true).where('forSale', '==', true).where('requestStatus', '==', 'pending').get()).docs.map(doc => ({...doc.data(), createdAt: doc.data()?.createdAt.toDate()})) as TicketType[]
    const bundlesRequests = (await admin.firestore().collection('bundles').where('requested', '==', true).where('status', '==', 'inEscrow').where('requestStatus', '==', 'pending').get()).docs.map(doc => ({...doc.data(), createdAt: doc.data()?.createdAt.toDate()})) as Bundle[]

    const eventsIds = [...ticketRequests.map(doc => doc?.eventId), ...bundlesRequests.map(doc => doc?.eventId)]
    const events = await Promise.all(eventsIds.map(async (eventId: string) => {
        return await getEvent(eventId)
    }))

    const userIds = [...ticketRequests.map(doc => doc?.userId), ...bundlesRequests.map(doc => doc?.userId)]
    const users = await Promise.all(userIds.map(async (userId: string) => {
        return (await admin.firestore().collection('users').doc(userId).get()).data() as UserType
    }))

    return (
        <section className='flex flex-col relative flex-1 items-center justify-start mt-16 gap-8 w-full overflow-hidden'>
            <div className='flex w-full items-center justify-between gap-4'>
                <Link href='/dashboard' className='bg-[#EB5E1B] rounded-[4px] font-light py-3 flex-1 text-sm max-w-[160px] w-screen px-6 text-white font-poppins'>Tickets Status</Link>
            </div>
            <div className='grid grid-cols-2 max-md:grid-cols-1 gap-4 w-full p-4'>
                {ticketRequests.map(ticket => {
                    const event = events.find(event => event?.id === ticket?.eventId)
                    const user = users.find(user => user?.id === ticket?.userId)

                    return (
                        <div key={ticket.id} className='flex flex-col gap-1'>
                            <div className='px-8 py-2 bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] font-medium text-white rounded-[8px]'>
                                <p className='text-xs font-poppins text-center'>Please send the buyer your tickets through E-mail.Once sent, please upload a proof that shows 
                                that you did send the ticket below. <br/><br/> Make sure to send the tickets using your {ticket?.platform} E-mail</p>
                            </div>
                            <div className='flex overflow-hidden gap-1 bg-white rounded-[8px] min-h-[115px] w-full'>
                                <Image
                                    src={event?.displayPageImage!}
                                    width={109} 
                                    height={115} 
                                    alt={event?.name!}
                                    // className='object-cover max-lg:max-w-32 max-lg:min-h-32 lg:min-w-48 lg:min-h-48 cursor-pointer hover:scale-105 transition-transform duration-300 ease-in-out rounded-lg'
                                />
                                <div className='flex flex-col gap-2 justify-between flex-1 px-2'>
                                    <p className='font-poppins font-medium text-sm mt-2'>{event?.name}</p>
                                    <div className='flex flex-wrap items-center justify-between mb-2'>
                                        <div className='flex flex-col gap-2 items-start justify-start'>
                                            <p className='font-poppins text-xs font-medium'>{Object.keys(ticket?.tickets)[0]}</p>
                                            <p className='font-poppins text-xs font-medium'>Individual Ticket</p>
                                            <p className='font-poppins text-xs font-medium'>{ticket.salePrice}</p>
                                        </div>
                                        <div className='flex flex-col gap-2 items-start justify-start'>
                                            <p className='font-poppins text-xs font-medium'>{user?.firstname} {user?.lastname}</p>
                                            <p className='font-poppins text-xs font-medium'>{user?.countryCode} {user?.phoneNumber?.startsWith('0') ? user?.phoneNumber.slice(1) : user?.phoneNumber}</p>
                                            <p className='font-poppins text-xs font-medium'>{user?.email}</p>
                                        </div>
                                        <div className='flex h-full items-end justify-end'>
                                            <UploadProofButton ticket={ticket} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}