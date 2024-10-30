import { ExchangeRate } from "@/lib/types/eventTypes";
import HotelRow from "./HotelRow";
import { Hotel } from "@/lib/types/hotelTypes";

type Props = {
    hotel: Hotel
    exchangeRate: ExchangeRate
    search: string | undefined
    filter: string | undefined
    // ticket: ItemType<{ type: 'individual' | 'bundle' }>
}

export default async function HotelRowContainer({ hotel, search, filter, exchangeRate }: Props) 
{
    if(search && !hotel.name.toLowerCase().includes(search?.toLowerCase()!)) return null
    if(filter && hotel.status !== filter) return null

    return <HotelRow hotel={hotel} />
}