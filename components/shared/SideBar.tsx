'use client'
import Image from "next/image";
import LogOut from "./LogOut";
import { LogOutIcon, MenuIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
import { useState } from "react";
import LocaleSwitcher from "./LocaleSwitcher";
import { useTranslation } from "react-i18next";

export default function SideBar({ params }: Readonly<{ params: { locale?: string; } }>)
{
    const router = useRouter()
    const pathname = usePathname()

    const [sheetOpen, setSheetOpen] = useState(false)

    const { t } = useTranslation()

    return (
        <>
            <aside className='hidden lg:block w-[320px] h-screen bg-[#452A7C1A] shadow-lg min-h-screen'>
                <div className='flex flex-col items-center w-full min-h-full'>
                    <div className='flex items-center justify-center w-full py-16 text-white'>
                        <Image
                            src="/assets/logoWhite.png"
                            width={150}
                            height={50}
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
                                <p>{t("dashboard")}</p>
                            </li>
                            <li 
                                onClick={() => router.push("/digital-products")} 
                                className={cn('flex items-center cursor-pointer justify-center text-lg font-poppins font-light w-full py-4 text-white px-4', pathname?.includes('/digital-products') ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'hover:bg-[#1d1926]')}
                            >
                                <p>{t("digitalProducts")}</p>
                            </li>
                            <li 
                                onClick={() => router.push("/")} 
                                className={cn('flex items-center cursor-pointer justify-center text-lg font-poppins font-light w-full py-4 text-white px-4', (!pathname?.includes('/dashboard') && !pathname?.includes('/digital-products') && !pathname?.includes('/hotel-reservations')) ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'hover:bg-[#1d1926] ')}
                            >
                                <p>{t("events")}</p>
                            </li>
                            <li 
                                onClick={() => router.push("/hotel-reservations")} 
                                className={cn('flex items-center cursor-pointer justify-center text-lg font-poppins font-light w-full py-4 text-white px-4', pathname?.includes('/hotel-reservations') ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'hover:bg-[#1d1926] ')}
                            >
                                <p>{t("hotelReservations")}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-4 mt-auto">
                        <LocaleSwitcher params={params} />
                        <div className='flex gap-2 items-end pb-8 justify-center w-full flex-1 text-white font-poppins font-light'>
                            <LogOutIcon />
                            <LogOut />
                        </div>
                    </div>
                </div>
            </aside>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger className="lg:hidden ml-4 mt-4 absolute z-[10]" asChild>
                    <MenuIcon stroke='#fff' />
                </SheetTrigger>
                <SheetContent side='left' className='block lg:hidden w-[320px] h-screen bg-[#000] shadow-lg min-h-screen'>
                    {/* <aside className='block lg:hidden w-[320px] h-screen bg-[#452A7C1A] shadow-lg min-h-screen'> */}
                        <div className='flex flex-col items-center w-full min-h-full'>
                            <div className='flex items-center justify-center w-full py-16 text-white'>
                                <Image
                                    src="/assets/logoWhite.png"
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
                                        onClick={() => {router.push("/dashboard"); setSheetOpen(false)}} 
                                        className={cn('flex items-center cursor-pointer justify-center text-lg font-poppins font-light w-full py-4 text-white px-4', pathname?.includes('/dashboard') ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'hover:bg-[#1d1926] ')}
                                    >
                                        <p>{t("dashboard")}</p>
                                    </li>
                                    <li 
                                        onClick={() => {router.push("/digital-products"); setSheetOpen(false)}} 
                                        className={cn('flex items-center cursor-pointer justify-center text-lg font-poppins font-light w-full py-4 text-white px-4', pathname?.includes('/digital-products') ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'hover:bg-[#1d1926]')}
                                    >
                                        <p>{t("digitalProducts")}</p>
                                    </li>
                                    <li 
                                        onClick={() => {router.push("/"); setSheetOpen(false)}} 
                                        className={cn('flex items-center cursor-pointer justify-center text-lg font-poppins font-light w-full py-4 text-white px-4', (!pathname?.includes('/dashboard') && !pathname?.includes('/digital-products') && !pathname?.includes('/hotel-reservations')) ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'hover:bg-[#1d1926] ')}
                                    >
                                        <p>{t("events")}</p>
                                    </li>
                                    <li 
                                        onClick={() => {router.push("/hotel-reservations"); setSheetOpen(false)}} 
                                        className={cn('flex items-center cursor-pointer justify-center text-lg font-poppins font-light w-full py-4 text-white px-4', pathname?.includes('/hotel-reservations') ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'hover:bg-[#1d1926] ')}
                                    >
                                        <p>{t("hotelReservations")}</p>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-4 mt-auto">
                                <LocaleSwitcher params={params} />
                                <div onClick={() => setSheetOpen(false)} className='flex gap-2 items-end pb-8 justify-center w-full flex-1 text-white font-poppins font-light'>
                                    <LogOutIcon />
                                    <LogOut />
                                </div>
                            </div>
                        </div>
                    {/* </aside> */}
                </SheetContent>
            </Sheet>
        </>
    )
}