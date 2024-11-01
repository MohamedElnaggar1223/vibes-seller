'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslation } from "react-i18next"

export default function FiltersTicketsTable({ filter, search, tab }: { filter: string | undefined, search: string | undefined, tab: string | undefined })
{
    const router = useRouter()

    const { t } = useTranslation()

    const [filterField, setFilterField] = useState(filter)

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterField(e.target.value)
        let query = (tab ? `tab=${tab}&` : '')
        if(search) query += `search=${search}&`
        if(e.target.value) query += `filter=${e.target.value}&`
        if(query) router.push(`/dashboard?${query}`)
        else router.push(`/dashboard`)
    }

    return (
        <div className='relative max-w-[160px] w-screen bg-white flex h-[43px] shadow-lg z-[9] gap-4 rounded-md items-center justify-evenly px-4'>
            <select value={filterField} onChange={handleFilterChange} className='w-full outline-none h-full'>
                <option value="">{t("all")}</option>
                <option value="pending">{t("Pending")}</option>
                <option value="sold">{t("Sold")}</option>
                <option value="cancelled">{t("Cancelled")}</option>
                <option value="onSale">{t("On Sale")}</option>
                <option value="inEscrow">{t("In Escrow")}</option>
            </select>
        </div>
    )
}