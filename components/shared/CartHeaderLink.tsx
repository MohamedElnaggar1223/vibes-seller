'use client'
import { UserType } from "@/lib/types/userTypes";
import { cn, toArabicNums } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Props = {
    user: UserType
}

export const revalidate = 120

export default function CartHeaderLink({ user }: Props) 
{
    const pathname = usePathname()
    const [hovered, setHovered] = useState(false)

    return (
        <Link onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} href='/cart' className={cn('relative font-poppins text-sm cursor-pointer md:text-lg font-[300] z-[9999] text-white transition-all')}>
            {(user.cart?.tickets?.length ?? 0) > 0 && (
                <div className='absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full flex justify-center items-center'>
                    <span className='text-white text-xs font-poppins font-normal'>{pathname?.startsWith('/ar') ? toArabicNums(`${user.cart?.tickets.length}`) : user.cart?.tickets.length}</span>
                </div>
            )}
            {pathname?.includes('/cart') ? (
                <Image
                    src="/assets/bag-active.svg"
                    width={23}
                    height={27}
                    alt="cart-active" 
                />
            ) : hovered ? (
                <Image
                    src="/assets/bag-hover.svg"
                    width={19}
                    height={23}
                    alt="cart-active" 
                />
            ) : (
                <Image
                    src="/assets/bag.svg"
                    width={19}
                    height={23}
                    alt="cart" 
                />
            )}
        </Link>
    )
}