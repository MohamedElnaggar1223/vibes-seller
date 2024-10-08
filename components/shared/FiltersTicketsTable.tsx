'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function FiltersTicketsTable({ filter, search }: { filter: string | undefined, search: string | undefined })
{
    const router = useRouter()

    const [filterField, setFilterField] = useState(filter)

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterField(e.target.value)
        let query = ''
        if(search) query += `search=${search}&`
        if(e.target.value) query += `filter=${e.target.value}&`
        if(query) router.push(`/dashboard?${query}`)
        else router.push(`/dashboard`)
    }

    return (
        <div className='relative max-w-[160px] w-screen bg-white flex h-[43px] shadow-lg z-[999999] gap-4 rounded-md items-center justify-evenly px-4'>
            <select value={filterField} onChange={handleFilterChange} className='w-full outline-none h-full'>
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
                <option value="cancelled">Cancelled</option>
                <option value="onSale">On Sale</option>
                <option value="inEscrow">In Escrow</option>
            </select>
        </div>
    )
}