'use client'
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SuccessMessage({ ticketsNum }: { ticketsNum: number })
{
    if(!ticketsNum) return null

    const router = useRouter()

    const [open, setOpen] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setOpen(false)
            router.push('/')
        }, 3000)
    }, [])

    return (
        <Dialog open={open}>
            <DialogContent className='text-center font-normal font-poppins flex flex-col'>
                <DialogHeader className='text-center font-semibold font-poppins flex items-center justify-center'>
                    Thank You!
                </DialogHeader>
                <div className='inline-block'>
                    We have received your ({ticketsNum}) tickets & will shortly be reviewed...
                        Check your <Link href='/dashboard' className='unify-price'>Dashboard</Link> for updates
                </div>
            </DialogContent>
        </Dialog>
    )
}