import { ExchangeRate } from "@/lib/types/eventTypes";
import DigitalProductRow from "./DigitalProductRow";
import { DigitalProduct } from "@/lib/types/digitalProductTypes";

type Props = {
    digitalProduct: DigitalProduct
    exchangeRate: ExchangeRate
    search: string | undefined
    filter: string | undefined
    // ticket: ItemType<{ type: 'individual' | 'bundle' }>
}

export default async function DigitalProductRowContainer({ digitalProduct, search, filter, exchangeRate }: Props) 
{
    if(search && !digitalProduct.title.toLowerCase().includes(search?.toLowerCase()!)) return null
    if(filter && digitalProduct.status !== filter) return null

    return <DigitalProductRow digitalProduct={digitalProduct} />
}