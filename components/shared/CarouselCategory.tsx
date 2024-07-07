import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel"
import { initAdmin } from "@/firebase/server/config"
import { EventType, ExchangeRate } from "@/lib/types/eventTypes"
import EventCard from "../cards/EventCard"
import { getExchangeRate } from "@/lib/utils"

type Props = {
    locale?: string | undefined
    title: string,
    subTitle: string,
    events: string[]
}

export default async function CarouselCategory({ locale, title, subTitle, events }: Props) 
{
    const admin = await initAdmin()
    const eventsDocs = events?.map(async (event) => {
        const eventDoc = await admin.firestore().collection('events').doc(event).get()
        return {
            ...eventDoc.data(),
            createdAt: eventDoc.data()?.createdAt.toDate(),
            eventTime: eventDoc.data()?.eventTime.toDate(),
            eventDate: eventDoc.data()?.eventDate.toDate(),
            updatedAt: eventDoc.data()?.updatedAt?.toDate(),
            gatesOpen: eventDoc.data()?.gatesOpen?.toDate(),
            gatesClose: eventDoc.data()?.gatesClose?.toDate(),
        } as EventType
    })
    const eventsDataPromise = await Promise.all(eventsDocs || [])

    const eventsData = eventsDataPromise.sort((a, b) => {
        if(a.createdAt && b.createdAt) return a.createdAt.getTime() - b.createdAt.getTime()
        else if(a.createdAt) return -1
        else if(b.createdAt) return 1
        else return 0
    })

    const exchangeRate = await getExchangeRate()

    return (
        <section dir={locale === 'ar' ? 'rtl' : 'ltr'} className='relative w-full flex items-center h-52 lg:h-[412px] justify-start gap-4 flex-row'>
            <Carousel
                opts={{
                    align: "start",
                    dragFree: true,
                    direction: locale === 'ar' ? 'rtl' : 'ltr'  
                }}
                className="h-full max-lg:max-w-[100vw] lg:flex-1 lg:ml-12 max-lg:mt-16"
            >
                <CarouselContent className=''>
                    <CarouselItem className='max-h-48 max-w-48 lg:max-h-[412px] lg:max-w-[412px]'>
                        <div className='flex flex-col gap-2 text-white mb-auto mt-2'>
                            <p className='font-poppins font-black text-xl lg:text-3xl'>{title}</p>
                            <div className='w-2/3 lg:w-3/12 h-[2px] bg-white mb-4' />
                            <p className='w-full font-poppins font-medium text-xs'>{subTitle}</p>
                        </div>
                    </CarouselItem>
                    {eventsData.map((event) => (
                        <EventCard key={event.id} locale={locale} event={event} exchangeRate={exchangeRate} />
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    )
}
