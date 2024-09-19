'use client'

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { db, storage } from "@/firebase/client/config"
import { Bundle, TicketType } from "@/lib/types/ticketTypes"
import { doc, runTransaction } from "firebase/firestore"
import { ref, uploadBytesResumable } from "firebase/storage"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

type Props = {
    ticket?: TicketType 
    bundle?: Bundle
}

export default function UploadProofButton({ ticket, bundle }: Props)
{
    const router = useRouter()

    const [loading, setLoading] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUploadProofPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true)

        const files = e.target.files

        if(!files || files.length === 0) return
 
        const proof = files[0]

        await runTransaction(db, async (transaction) => {
            if(ticket)
            {
                const ticketDoc = doc(db, 'tickets', ticket.id)
                await transaction.update(ticketDoc, { proofPath: 'proofs/tickets/' + ticket.id })

                const storageRef = ref(storage, `proofs/tickets/${ticket.id}`)
                await uploadBytesResumable(storageRef, proof);
            }
            else if(bundle)
            {
                const bundleDoc = doc(db, 'bundles', bundle.id)
                await transaction.update(bundleDoc, { proofPath: 'proofs/bundles/' + bundle.id })

                const storageRef = ref(storage, `proofs/bundles/${bundle.id}`)
                await uploadBytesResumable(storageRef, proof);
            }
        })

        setLoading(false)
        router.refresh()
    }

    return (
        <>
            {(ticket && ticket.proofPath) ? (
                <p className='font-poppins text-[#E72377]'>Under Review</p>
            ) : (bundle && bundle.proofPath) ? (
                <p className='font-poppins text-[#E72377]'>Under Review</p>
            ) : (
                <button onClick={() => fileInputRef.current?.click()} className='px-1 py-2 bg-black gap-2 mt-auto text-xs font-light text-white text-nowrap flex items-center justify-center rounded-[8px]'>
                    <input onChange={handleUploadProofPdf} className='hidden absolute w-full h-full' type='file' multiple accept=".pdf" ref={fileInputRef} />
                    <Image
                        src='/assets/uploaded.svg'
                        width={20}
                        height={17}
                        alt='upload' 
                    />
                    Upload Proof
                </button>
            )}
            <Dialog open={loading}>
                <DialogContent className='flex items-center justify-center bg-transparent border-none outline-none'>
                    <Loader2 className='animate-spin' size={42} color="#5E1F3C" />
                </DialogContent>
            </Dialog>
        </>
    )
}