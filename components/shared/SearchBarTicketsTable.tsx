'use client'
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

export default function SearchBarTicketsTable({ search, filter }: { search: string | undefined, filter: string | undefined })
{
    const { t } = useTranslation()
    const router = useRouter()

    const [searchField, setSearchField] = useState(search)

    const handleSubmit = (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault()
        let query = ''
        if(searchField) query += `search=${searchField}&`
        if(filter) query += `filter=${filter}&`
        if(query) router.push(`/dashboard?${query}`)
        else router.push(`/dashboard`)
    }

    return (
        <div className='relative max-w-[360px] w-screen bg-white flex shadow-lg z-[99] gap-4 rounded-md items-center justify-evenly px-4'>
            <Image
                src='/assets/searchIcon.svg'
                width={24}
                height={24}
                alt='search'
                className='mr-[-5px] cursor-pointer max-lg:w-[20px] max-lg:h-[20px]' 
                onClick={() => handleSubmit()}
            />
            <form                    
                className={cn('flex flex-1 my-2 p-0 border-l-[1px] pl-4 border-[#E5E5E5] text-[10px] font-poppins py-0.5 md:py-1.5 outline-none')} 
                onSubmit={handleSubmit}
            >
                <input 
                    placeholder={t('search')}
                    className='w-full flex-1 p-0 text-[10px] font-poppins outline-none' 
                    value={searchField}
                    onChange={e => setSearchField(e.target.value)}
                />
            </form>
        </div>
    )
}