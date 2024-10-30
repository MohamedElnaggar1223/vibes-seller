import { formatTime, getEvent, initTranslations, toArabicTime } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import ClientDates from "./clientdates";
import UserTickets from "@/components/shared/UserTickets";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import UserTicketsLoading from "./userticketsloading";

type Props = {
    params: {
        id: string
        locale?: string | undefined
    }
}

export default async function EventPage({ params }: Props)
{
    const event = await getEvent(params.id)

    const { t } = await initTranslations(params.locale!, ['homepage', 'common'])

    return (
        <section className='flex flex-col relative flex-1 items-center justify-start p-12 gap-8'>
            <div className='flex gap-4 max-lg:flex-col'>
                <div key={event?.id} className='max-lg:max-w-32 max-lg:min-h-32 lg:min-w-56 lg:min-h-56 rounded-lg overflow-hidden'>
                    <Image
                        src={event?.displayPageImage!}
                        width={224} 
                        height={224} 
                        alt={event?.name!}
                        className='object-cover max-lg:max-w-32 max-lg:min-h-32 lg:min-w-56 lg:min-h-56 cursor-pointer rounded-lg'
                        loading="lazy"
                    />
                </div>
                <div className='flex flex-col gap-4 items-start justify-center'>
                    <h1 className='font-poppins text-lg lg:text-2xl font-bold text-white'>{params.locale === 'ar' ? event?.nameArabic : event?.name}</h1>
                    <div className='flex flex-col gap-3'>
                        <div className='w-full flex justify-between items-center gap-2'>
                            <p className='font-poppins text-md lg:text-base font-extralight text-white'>{params.locale === 'ar' ? event?.venueArabic : event?.venue}</p>
                            <span className='font-poppins text-md lg:text-base font-extralight text-white'>{" | "}</span>
                            <p className='font-poppins text-md lg:text-base font-extralight text-white mr-4'>{params.locale === 'ar' ? event?.cityArabic : event?.city}, {t(`${event?.country.replaceAll(" ", "")}`)}</p>
                        </div>
                        <ClientDates locale={params.locale} selectedEvent={event!} className='font-poppins text-md lg:text-base font-extralight text-white' />
                        <p className='font-poppins text-md lg:text-base font-extralight text-white'>{event?.gatesOpen && `${t('gatesOpen')} ${params.locale === 'ar' ? toArabicTime(formatTime(event?.gatesOpen)) : formatTime(event?.gatesOpen)}`} {event?.gatesClose && `| ${t('gatesClose')} ${params.locale === 'ar' ? toArabicTime(formatTime(event?.gatesClose)) : formatTime(event?.gatesClose)}`}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <p className='font-poppins text-xs lg:text-md font-normal text-white'>{event?.tickets?.length ?? 0} Tickets categories</p>
                        {event?.parkingPass && <p className='font-poppins text-xs lg:text-md font-normal text-white'>Parking Pass Available</p>}
                    </div>
                </div>
            </div>
            {/* <Suspense fallback={<Loader2 size={52} className='animate-spin' />}> */}
            <Suspense fallback={<UserTicketsLoading />}>
                <UserTickets eventId={params.id} />
            </Suspense>
        </section>
    )
} 