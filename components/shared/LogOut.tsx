'use client'
import { auth } from "@/firebase/client/config";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "../ui/dialog";
import { Loader2 } from "lucide-react";

export default function LogOut()
{
    const [loading, setLoading] = useState(false)

    const { t } = useTranslation()
    
    const handleLogout = async () => {
        setLoading(true)
        await auth.signOut()
        await signOut()
        setLoading(false)
    }

    return (
        <>
            <span onClick={handleLogout} className='cursor-pointer items-center justify-center font-poppins font-normal text-base text-center flex gap-4'>
                {t('logOut')}
            </span>
            <Dialog open={loading}>
                <DialogContent className='flex items-center justify-center bg-transparent border-none outline-none'>
                    <Loader2 className='animate-spin' size={42} color="#5E1F3C" />
                </DialogContent>
			</Dialog>
        </>
    )
}