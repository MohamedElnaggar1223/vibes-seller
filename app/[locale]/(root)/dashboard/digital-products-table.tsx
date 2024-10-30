import FiltersDigitalProductsTable from "@/components/shared/FiltersTicketsTable"
import SearchBarDigitalProductsTable from "@/components/shared/SearchBarTicketsTable"
import DigitalProductRowContainer from "@/components/shared/DigitalProductRowContainer"
import { initAdmin } from "@/firebase/server/config"
import { DigitalProduct } from "@/lib/types/digitalProductTypes"
import { UserType } from "@/lib/types/userTypes"
import Link from "next/link"
import { ExchangeRate } from "@/lib/types/eventTypes"

type Props = {
    user: UserType
    exchangeRate: ExchangeRate
    search?: string
    filter?: string
}

export default async function DigitalProductsTable({ search, filter, user, exchangeRate }: Props)
{
    const admin = await initAdmin()
    
    const digitalProductsCollection = admin.firestore().collection('digitalProducts')

    const userDigitalProductsListings = (await digitalProductsCollection.where('userId', '==', user.id).get()).docs.map(doc => ({...doc.data(), id: doc.id})) as unknown as DigitalProduct[]

    return (
        <section className='flex flex-col relative flex-1 items-center justify-start mt-16 gap-8 w-full overflow-hidden'>
            <div className='flex w-full items-center justify-between gap-4'>
                <div className='flex gap-4 items-center justify-center ml-auto'>
                    <SearchBarDigitalProductsTable tab='digital-products' search={search} filter={filter} />
                    <FiltersDigitalProductsTable tab='digital-products' search={search} filter={filter} />
                </div>
            </div>
            <div className="flex w-full overflow-auto">
                <div className='flex flex-col gap-2 w-full flex-1 overflow-auto relative min-w-[960px]'>
                    <div className='flex w-full sticky top-0 items-center justify-between bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] rounded-lg'>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>Transaction Title</div>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>Item Name</div>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>Item Category</div>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>Inspection Period</div>
                        <div className='flex-[0.45] py-6 font-medium text-xs text-white text-center font-poppins'>Price</div>
                        <div className='flex-1 py-6 font-medium text-xs text-white text-center font-poppins'>Status</div>
                    </div>
                    <div className='flex flex-col gap-2 w-full'>
                        {userDigitalProductsListings.map(digitalProduct => <DigitalProductRowContainer exchangeRate={exchangeRate} key={digitalProduct.id} digitalProduct={digitalProduct} search={search} filter={filter} />)}
                    </div>
                </div>
            </div>
        </section>
    )
}