'use client'
import { DigitalProduct } from "@/lib/types/digitalProductTypes"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/firebase/client/config"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"


const statusOptions = {
    sold: {
        text: 'Sold',
        color: 'text-[#ff0000]',
        bg: 'bg-[#CCF5D2]'
    },
    pending: {
        text: 'Pending',
        color: 'text-[#000]',
        bg: 'bg-[#CCCCCC]'
    },
    inEscrow: {
        text: 'In Escrow',
        color: 'text-[#7D40FF]',
        bg: 'bg-[#CCCCCC]'
    },
    onSale: {
        text: 'On Sale',
        color: 'text-[#000]',
        bg: 'bg-[#CCF5D2]'
    },
    cancelled: {
        text: 'Cancelled',
        color: 'text-[#000]',
        bg: 'bg-[#CCCCCC]'
    }
}

type Props = {
    digitalProduct: DigitalProduct
}

export default function DigitalProductRow({ digitalProduct }: Props)
{
    const router = useRouter()

    const [digitalProductOpen, setDigitalProductOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deleteDigitalProduct, setDeleteDigitalProduct] = useState(false)

    const handleDeleteDigitalProduct = async () => {
        setLoading(true)
        const digitalProductDoc = doc(db, 'digitalProducts', digitalProduct.id)
        await deleteDoc(digitalProductDoc)
        setLoading(false)
        router.refresh()
    }

    // const handleUpdatePrice = async (price: number) => {
    //     setLoading(true)
    //     const digitalProductDoc = doc(db, 'digitalProducts', digitalProduct.id)
    //     await updateDoc(digitalProductDoc, { price })
    //     setLoading(false)
    //     router.refresh()
    // }

    return (
        <>
            <div onClick={() => setDigitalProductOpen(true)} className='flex w-full items-center justify-between rounded-lg cursor-pointer'>
                <div className='flex-1 h-[60px] rounded-tl-lg overflow-hidden rounded-bl-lg font-medium flex items-center justify-between text-xs text-black text-center font-poppins'>
                    <p className={cn('font-medium text-black h-full flex-1 text-center flex items-center justify-center', digitalProduct.status === 'sold' ? 'bg-[#A3CCA9]' : 'bg-[#fff]')}>{digitalProduct?.title}</p> 
                </div>
                <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', digitalProduct.status === 'sold' ? 'bg-[#CCF5D2]' : 'bg-[#CCCCCC]')}>{digitalProduct.itemName}</div>
                <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', digitalProduct.status === 'sold' ? 'bg-[#A3CCA9]' : 'bg-[#fff]')}>{digitalProduct.itemCategory}</div>
                <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', digitalProduct.status === 'sold' ? 'bg-[#CCF5D2]' : 'bg-[#CCCCCC]')}>{digitalProduct.inspectionPeriod}</div>
                <div className={cn('flex-[0.45] h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', digitalProduct.status === 'sold' ? 'bg-[#CCF5D2]' : 'bg-[#fff]')}>{digitalProduct.price} {digitalProduct.currency}</div>
                <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins rounded-tr-lg rounded-br-lg', 'flex-col gap-2', statusOptions[digitalProduct.status!].bg, statusOptions[digitalProduct.status!].color)}>
                    {statusOptions[digitalProduct.status!].text}
                </div>
            </div>
            <Dialog open={digitalProductOpen} onOpenChange={setDigitalProductOpen}>
                <DialogContent className='flex flex-col gap-2 w-full border-none outline-none py-6 z-[9999999999999999]'>
                    <DialogHeader className='flex items-center justify-center'>
                        <DialogTitle className={cn('font-medium font-poppins text-center', ((digitalProduct.status === 'cancelled')) && 'text-[#ff0000]')}>
                            {digitalProduct.title} {((digitalProduct.status === 'cancelled')) && 'Rejected'}
                            {/* {((digitalProduct.status === 'pending')) && <span className='text-[#ff0000] w-full !text-center mt-2 !mx-auto'><br/><br/>Pending</span>} */}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-1 items-start justify-center w-full">
                        <p>Transaction Title</p>
                        <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', (digitalProduct.status !== 'sold') && 'opacity-40')}>
                            {/* <div className='flex gap-2 items-center justify-center'>
                                <div className={cn('w-6 h-6 rounded-full', digitalProduct.status === 'pending' ? 'bg-[#D9D9D9]' : 'bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]')} />
                            </div> */}
                            {/* <div className='flex gap-2 items-center'>
                                <div className='p-1 bg-[#55555580] rounded-[4px] flex items-center justify-center text-center'>
                                    <input autoFocus={false} value={price} onChange={(e) => (/^-?\d*\.?\d+$/.test(e.target.value) || e.target.value === '') ? setPrice(e.target.value) : setPrice(prev => prev)} placeholder="0.00" className='text-center text-white font-poppins text-sm font-normal bg-transparent outline-none w-[3.5rem]' />
                                    <p className='font-medium text-sm font-poppins text-white'>{digitalProduct.country}</p>
                                </div>
                                {(typeof price === 'string' ? parseFloat(price) : price) !== digitalProduct.price && <div className='cursor-pointer rounded-full w-5 h-5 bg-white flex items-center justify-center' onClick={() => handleUpdatePrice(typeof price === 'string' ? parseFloat(price) : price!)}><Check size={16} /></div>}
                            </div> */}
                            
                            {/* {digitalProduct.status === 'sold' && <p className='text-xs font-medium font-poppins text-[#FF0000]'>Sold</p>} */}
                            {/* {(digitalProduct.status !== 'sold') && <p className='text-xs font-medium font-poppins text-[#ff0000]'>Event Ended</p>} */}
                            {digitalProduct.title}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-start justify-center w-full">
                        <p>Role</p>
                        <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', (digitalProduct.status !== 'sold') && 'opacity-40')}>
                            {digitalProduct.role}
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 w-full">
                        <div className="flex flex-col gap-1 items-start justify-center w-full">
                            <p>Item Name</p>
                            <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', (digitalProduct.status !== 'sold') && 'opacity-40')}>
                                {digitalProduct.itemName}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 items-start justify-center w-full">
                            <p>Item Category</p>
                            <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', (digitalProduct.status !== 'sold') && 'opacity-40')}>
                                {digitalProduct.itemCategory}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 w-full">
                        <div className="flex flex-col gap-1 items-start justify-center w-full">
                            <p>Price</p>
                            <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', (digitalProduct.status !== 'sold') && 'opacity-40')}>
                                {digitalProduct.price}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 items-start justify-center w-full">
                            <p>Inspection Period</p>
                            <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', (digitalProduct.status !== 'sold') && 'opacity-40')}>
                                {digitalProduct.inspectionPeriod ?? 0}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-start justify-center w-full">
                        <p>Item Description</p>
                        <div className={cn('flex gap-2 w-full min-h-[53px] items-center justify-between bg-black px-4 py-2 text-white', (digitalProduct.status !== 'sold') && 'opacity-40')}>
                            {digitalProduct.itemDescription}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-start justify-center w-full">
                        <p>Notes</p>
                        <div className={cn('flex gap-2 w-full min-h-[53px] items-center justify-between bg-black px-4 py-2 text-white', (digitalProduct.status !== 'sold') && 'opacity-40')}>
                            {digitalProduct.notes}
                        </div>
                    </div>
                    {(digitalProduct.status !== 'inEscrow' && digitalProduct.status !== 'sold' && digitalProduct.status !== 'cancelled') && <button type='button' onMouseDown={() => setDeleteDigitalProduct(true)} className='font-light bg-[#FF000080] border ml-auto mt-2 border-[#ff0000] rounded-[4px] w-[118px] h-[35px] text-xs font-poppins cursor-pointer text-black outline-none'>Delete listing</button>} 
                </DialogContent>
            </Dialog>
            <Dialog open={loading}>
                <DialogContent className='flex items-center justify-center bg-transparent border-none outline-none z-[9999999999999999]'>
                    <Loader2 className='animate-spin' size={42} color="#5E1F3C" />
                </DialogContent>
            </Dialog>
            <Dialog open={deleteDigitalProduct} onOpenChange={setDeleteDigitalProduct}>
                <DialogContent className='z-[99999999999999999]'>
                    <DialogHeader>
                        Are you sure you want to delete this Digital Product?
                    </DialogHeader>
                    <DialogFooter>
                        <button onClick={() => setDeleteDigitalProduct(false)} className='font-light outline-none bg-[#FF000080] border border-[#ff0000] rounded-[4px] w-[118px] h-[35px] text-xs font-poppins cursor-pointer text-black'>Cancel</button>
                        <button onClick={handleDeleteDigitalProduct} className='font-light outline-none bg-[#FF000080] border border-[#ff0000] rounded-[4px] w-[118px] h-[35px] text-xs font-poppins cursor-pointer text-black'>Delete</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}