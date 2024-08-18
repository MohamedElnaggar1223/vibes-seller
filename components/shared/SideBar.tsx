'use client'
import Image from "next/image";
import LogOut from "./LogOut";
import { LogOutIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SideBar()
{
    const router = useRouter()
    const pathname = usePathname()

    return (
        <aside className='hidden md:block w-[320px] h-screen bg-[#452A7C1A] shadow-lg min-h-screen'>
            <div className='flex flex-col items-center w-full min-h-full'>
                <div className='flex items-center justify-center w-full py-16 text-white'>
                    <Image
                        src="/assets/logo.png"
                        width={209}
                        height={78}
                        alt="logo"
                        className='cursor-pointer max-lg:w-[120px] max-lg:h-[45px]'
                        priority
                    />
                </div>
                <div className='flex flex-col items-center justify-center w-full'>
                    <ul className='w-full flex flex-col gap-4'>
                        <li 
                            onClick={() => router.push("/dashboard")} 
                            className={cn('flex items-center cursor-pointer justify-center text-lg font-poppins font-light w-full py-4 text-white px-4', pathname?.includes('/dashboard') ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'hover:bg-[#1d1926] ')}
                        >
                            <p>Dashboard</p>
                        </li>
                        <li 
                            // onClick={() => router.push("/digital-products")} 
                            className={cn('flex opacity-40 items-center justify-center text-lg font-poppins font-light w-full py-4 text-white px-4', pathname?.includes('/digital-prodcuts') ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'cursor-default')}
                        >
                            <p>Digital Products</p>
                        </li>
                        <li 
                            onClick={() => router.push("/")} 
                            className={cn('flex items-center cursor-pointer justify-center text-lg font-poppins font-light w-full py-4 text-white px-4', (!pathname?.includes('/dashboard') && !pathname?.includes('/digital-prodcuts') && !pathname?.includes('/hotel-reservations')) ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'hover:bg-[#1d1926] ')}
                        >
                            <p>Events</p>
                        </li>
                        <li 
                            // onClick={() => router.push("/hotel-reservations")} 
                            className={cn('flex opacity-40 items-center justify-center text-lg font-poppins font-light w-full py-4 text-white px-4', pathname?.includes('/hotel-reservations') ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'cursor-default')}
                        >
                            <p>Hotel Reservations</p>
                        </li>
                    </ul>
                </div>
                <div className='flex gap-2 items-end pb-8 justify-center w-full flex-1 text-white font-poppins font-light'>
                    <LogOutIcon />
                    <LogOut />
                </div>
            </div>
        </aside>
    )
}