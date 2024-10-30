'use client'
import { Hotel } from "@/lib/types/hotelTypes"
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
    hotel: Hotel
}

export default function HotelRow({ hotel }: Props)
{
    const router = useRouter()

    const [hotelOpen, setHotelOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deleteHotel, setDeleteHotel] = useState(false)

    const reservationEnded = hotel.date.from < new Date()

    const handleDeleteHotel = async () => {
        setLoading(true)
        const hotelDoc = doc(db, 'hotels', hotel.id)
        await deleteDoc(hotelDoc)
        setLoading(false)
        router.refresh()
    }

    // const handleUpdatePrice = async (price: number) => {
    //     setLoading(true)
    //     const hotelDoc = doc(db, 'hotels', hotel.id)
    //     await updateDoc(hotelDoc, { price })
    //     setLoading(false)
    //     router.refresh()
    // }

    return (
        <>
            <div onClick={() => setHotelOpen(true)} className='flex w-full items-center justify-between rounded-lg cursor-pointer'>
                <div className='flex-1 h-[60px] rounded-tl-lg overflow-hidden rounded-bl-lg font-medium flex items-center justify-between text-xs text-black text-center font-poppins'>
                    <p className={cn('font-medium text-black h-full flex-1 text-center flex items-center justify-center', hotel.status === 'sold' ? 'bg-[#A3CCA9]' : 'bg-[#fff]')}>{hotel?.name}</p> 
                </div>
                <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', hotel.status === 'sold' ? 'bg-[#CCF5D2]' : 'bg-[#CCCCCC]')}>{hotel.roomType} - {hotel.boardType}</div>
                <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', hotel.status === 'sold' ? 'bg-[#A3CCA9]' : 'bg-[#fff]')}>{hotel.date.from.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'}).replace(/(\d+)/, '$1')} - {hotel.date.to.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'}).replace(/(\d+)/, '$1')}</div>
                <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', hotel.status === 'sold' ? 'bg-[#CCF5D2]' : 'bg-[#CCCCCC]')}>{hotel.itineraryNumber}</div>
                <div className={cn('flex-[0.45] h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins', hotel.status === 'sold' ? 'bg-[#CCF5D2]' : 'bg-[#fff]')}>{hotel.price} {hotel.country}</div>
                <div className={cn('flex-1 h-full flex items-center justify-center font-medium text-xs text-black text-center font-poppins rounded-tr-lg rounded-br-lg', reservationEnded && 'flex-col gap-2', statusOptions[hotel.status!].bg, statusOptions[hotel.status!].color)}>
                    {reservationEnded && <p className='font-medium text-sm font-poppins text-[#ff0000]'>Reservation Ended</p>}
                    {(!reservationEnded) && statusOptions[hotel.status!].text}
                </div>
            </div>
            <Dialog open={hotelOpen} onOpenChange={setHotelOpen}>
                <DialogContent className='flex flex-col gap-2 w-full border-none outline-none py-6 z-[9999999999999999]'>
                    <DialogHeader className='flex items-center justify-center'>
                        <DialogTitle className={cn('font-medium font-poppins text-center', ((hotel.status === 'cancelled')) && 'text-[#ff0000]')}>
                            {hotel.name} {((hotel.status === 'cancelled')) && 'Rejected'}
                            {/* {((hotel.status === 'pending')) && <span className='text-[#ff0000] w-full !text-center mt-2 !mx-auto'><br/><br/>Pending</span>} */}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-1 items-start justify-center w-full">
                        <p>Hotel Detailed Address & Zip Code</p>
                        <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', reservationEnded && (hotel.status !== 'sold') && 'opacity-40')}>
                            {/* <div className='flex gap-2 items-center justify-center'>
                                <div className={cn('w-6 h-6 rounded-full', hotel.status === 'pending' ? 'bg-[#D9D9D9]' : 'bg-gradient-to-b from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]')} />
                            </div> */}
                            {/* <div className='flex gap-2 items-center'>
                                <div className='p-1 bg-[#55555580] rounded-[4px] flex items-center justify-center text-center'>
                                    <input autoFocus={false} value={price} onChange={(e) => (/^-?\d*\.?\d+$/.test(e.target.value) || e.target.value === '') ? setPrice(e.target.value) : setPrice(prev => prev)} placeholder="0.00" className='text-center text-white font-poppins text-sm font-normal bg-transparent outline-none w-[3.5rem]' />
                                    <p className='font-medium text-sm font-poppins text-white'>{hotel.country}</p>
                                </div>
                                {(typeof price === 'string' ? parseFloat(price) : price) !== hotel.price && <div className='cursor-pointer rounded-full w-5 h-5 bg-white flex items-center justify-center' onClick={() => handleUpdatePrice(typeof price === 'string' ? parseFloat(price) : price!)}><Check size={16} /></div>}
                            </div> */}
                            
                            {/* {hotel.status === 'sold' && <p className='text-xs font-medium font-poppins text-[#FF0000]'>Sold</p>} */}
                            {/* {reservationEnded && (hotel.status !== 'sold') && <p className='text-xs font-medium font-poppins text-[#ff0000]'>Event Ended</p>} */}
                            {hotel.address} - {hotel.zipCode}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-start justify-center w-full">
                        <p>Full Name</p>
                        <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', reservationEnded && (hotel.status !== 'sold') && 'opacity-40')}>
                            {hotel.fullName}
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 w-full">
                        <div className="flex flex-col gap-1 items-start justify-center w-full">
                            <p>Phone Number</p>
                            <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', reservationEnded && (hotel.status !== 'sold') && 'opacity-40')}>
                                {hotel.countryCode} {hotel.phoneNumber}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 items-start justify-center w-full">
                            <p>Email</p>
                            <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', reservationEnded && (hotel.status !== 'sold') && 'opacity-40')}>
                                {hotel.email}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-start justify-center w-full">
                        <p>Booking Platform</p>
                        <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', reservationEnded && (hotel.status !== 'sold') && 'opacity-40')}>
                            {hotel.name} {hotel.website && `/ ${hotel.website}`}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-start justify-center w-full">
                        <p>Room Type</p>
                        <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', reservationEnded && (hotel.status !== 'sold') && 'opacity-40')}>
                            {hotel.roomType}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-start justify-center w-full">
                        <p>Board Type</p>
                        <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', reservationEnded && (hotel.status !== 'sold') && 'opacity-40')}>
                            {hotel.boardType}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-start justify-center w-full">
                        <p>Check In - Check Out</p>
                        <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', reservationEnded && (hotel.status !== 'sold') && 'opacity-40')}>
                            {hotel.date.from.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'}).replace(/(\d+)/, '$1')} - {hotel.date.to.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'}).replace(/(\d+)/, '$1')}
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 w-full">
                        <div className="flex flex-col gap-1 items-start justify-center w-full">
                            <p>Adults</p>
                            <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', reservationEnded && (hotel.status !== 'sold') && 'opacity-40')}>
                                {hotel.adults}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 items-start justify-center w-full">
                            <p>Children</p>
                            <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', reservationEnded && (hotel.status !== 'sold') && 'opacity-40')}>
                                {hotel.children ?? 0}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 w-full">
                        <div className="flex flex-col gap-1 items-start justify-center w-full">
                            <p>Itenirary Number</p>
                            <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', reservationEnded && (hotel.status !== 'sold') && 'opacity-40')}>
                                {hotel.itineraryNumber}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 items-start justify-center w-full">
                            <p>Price</p>
                            <div className={cn('flex gap-2 w-full items-center justify-between bg-black px-4 py-2 text-white', reservationEnded && (hotel.status !== 'sold') && 'opacity-40')}>
                                {hotel.price ?? 0} {hotel.country}
                            </div>
                        </div>
                    </div>
                    {(hotel.status !== 'sold' && hotel.status !== 'cancelled' && !reservationEnded) && <button type='button' onMouseDown={() => setDeleteHotel(true)} className='font-light bg-[#FF000080] border ml-auto mt-2 border-[#ff0000] rounded-[4px] w-[118px] h-[35px] text-xs font-poppins cursor-pointer text-black outline-none'>Delete listing</button>} 
                </DialogContent>
            </Dialog>
            <Dialog open={loading}>
                <DialogContent className='flex items-center justify-center bg-transparent border-none outline-none z-[9999999999999999]'>
                    <Loader2 className='animate-spin' size={42} color="#5E1F3C" />
                </DialogContent>
            </Dialog>
            <Dialog open={deleteHotel} onOpenChange={setDeleteHotel}>
                <DialogContent className='z-[99999999999999999]'>
                    <DialogHeader>
                        Are you sure you want to delete this hotel?
                    </DialogHeader>
                    <DialogFooter>
                        <button onClick={() => setDeleteHotel(false)} className='font-light outline-none bg-[#FF000080] border border-[#ff0000] rounded-[4px] w-[118px] h-[35px] text-xs font-poppins cursor-pointer text-black'>Cancel</button>
                        <button onClick={handleDeleteHotel} className='font-light outline-none bg-[#FF000080] border border-[#ff0000] rounded-[4px] w-[118px] h-[35px] text-xs font-poppins cursor-pointer text-black'>Delete</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}