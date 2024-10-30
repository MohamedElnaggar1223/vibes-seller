'use client'

import { cn } from "@/lib/utils"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useContext, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { db, storage } from "@/firebase/client/config"
import { collection, doc, runTransaction } from "firebase/firestore"
import { ref, uploadBytesResumable } from "firebase/storage"
import { useRouter } from "next/navigation"
import { UserType } from "@/lib/types/userTypes"
import { CountryContext } from "@/providers/CountryProvider"

const hotelReservationSchema = z.object({
    name: z.string().min(3, {
        message: 'Name must be at least 3 characters long'
    }),
    website: z.string().optional(),
    address: z.string().min(3, {
        message: 'Address must be at least 3 characters long'
    }),
    zipCode: z.string().min(3, {
        message: 'Zip code must be at least 3 characters long'
    }),
    roomType: z.string().min(3, {
        message: 'Room type must be at least 3 characters long'
    }),
    boardType: z.string().min(3, {
        message: 'Board type must be at least 3 characters long'
    }),
    date: z.object({
        from: z.date(),
        to: z.date()
    }).refine(({ from, to }) => from <= to, {
        message: 'Check out date must be after check'
    }).refine(({ from }) => from >= new Date(), {
        message: 'Check in date must be in the future'
    }).refine(({ to }) => to >= new Date(), {
        message: 'Check out date must be in the future'
    }),
    adults: z.string().refine((adults) => parseInt(adults) >= 0, {
        message: 'Adults must be at least 0'
    }),
    children: z.string().optional().refine((children) => children ? parseInt(children) >= 0 : true, {
        message: 'Children must be at least 0'
    }),
    fullName: z.string().min(3, {
        message: 'Full name must be at least 3 characters long'
    }),
    countryCode: z.enum(['+20']),
    phoneNumber: z.string().min(7, {
        message: 'Phone number must be at least 7 characters long'
    }),
    email: z.string().email(),
    bookingMethod: z.string().min(3, {
        message: 'Booking method must be at least 3 characters long'
    }),
    itineraryNumber: z.string().refine((adults) => parseInt(adults) >= 0, {
        message: 'Itinerary number must be a number'
    }),
    price: z.string().refine((adults) => parseInt(adults) >= 1, {
        message: 'price must be at least 1'
    })
})

export default function HotelReservationsForm({ user }: { user: UserType })
{
    const context = useContext(CountryContext)
    if(!context) return <Loader2 className='animate-spin' />
    const { country } = context

    const router = useRouter()

    const fileInputRef = useRef<HTMLInputElement>(null)

    const [tab, setTab] = useState<'hotel-details' | 'booking-details' | 'verification'>('hotel-details')
    const [uploadedProof, setUploadedProof] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const tomorrow = useMemo(() => {
        const tom = new Date();
        tom.setDate(tom.getDate() + 1);
        tom.setHours(0, 0, 0, 0);
        return tom
    }, [])

    const form = useForm<z.infer<typeof hotelReservationSchema>>({
        resolver: zodResolver(hotelReservationSchema),
        defaultValues: {
            name: '',
            website: '',
            address: '',
            zipCode: '',
            roomType: '',
            boardType: '',
            date: {
                from: tomorrow,
                to: tomorrow
            },
            adults: '',
            children: '',
            bookingMethod: '',
            countryCode: '+20',
            email: '',
            fullName: '',
            itineraryNumber: '',
            phoneNumber: '',
            price: ''
        },
    })
    
    const canNextFirstSection = useMemo(() => {
        return [form.getValues('adults'), form.getValues('date'), form.getValues('name'), form.getValues('address'), form.getValues('zipCode'), form.getValues('roomType'), form.getValues('boardType')].every(value => value)
    }, [form.getValues('address'), form.getValues('adults'), form.getValues('boardType'), form.getValues('date'), form.getValues('name'), form.getValues('roomType'), form.getValues('zipCode')])

    const canNextSecondSection = useMemo(() => {
        return [form.getValues('fullName'), form.getValues('countryCode'), form.getValues('phoneNumber'), form.getValues('email'), form.getValues('bookingMethod'), form.getValues('itineraryNumber'), form.getValues('price')].every(value => value)
    }, [form.getValues('bookingMethod'), form.getValues('countryCode'), form.getValues('email'), form.getValues('fullName'), form.getValues('itineraryNumber'), form.getValues('phoneNumber'), form.getValues('price')])

    async function onSubmit(values: z.infer<typeof hotelReservationSchema>) {
        if(!uploadedProof) return

        setLoading(true)

        try
        {
            await runTransaction(db, async (transaction) => {
                const hotelDoc = doc(collection(db, "hotels"))
    
                const proof = `hotels/${hotelDoc.id}`
    
                const addedHotel = {
                    ...values,
                    proof,
                    status: 'pending',
                    userId: user.id,
                    country
                }
    
                await transaction.set(hotelDoc, addedHotel)
                const storageRef = ref(storage, proof)
                await uploadBytesResumable(storageRef, uploadedProof);
            })

            router.push('/dashboard?tab=hotel-reservations')
        }
        catch(e: any)
        {
            setError(e?.message ?? 'Something went wrong')
        }
        finally
        {
            setLoading(false)
        }
    }

    form.watch('date')

    const handleUploadTicketsPdfs = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files

        if(!files) return
        
        setUploadedProof(files[0])
    }

    return (
        <div className='lg:w-screen lg:max-w-[720px] flex flex-col rounded-[20px] overflow-hidden'>
            <div className='flex items-center justify-center w-full bg-black pb-4 pt-6 lg:px-4 divide-x !divide-[#808080]'>
                <div className={cn('flex flex-1 items-center justify-center gap-2', (tab === 'booking-details' || tab === 'verification') && 'max-lg:hidden')}>
                    <span className={cn('font-extrabold', (tab === 'hotel-details' || !tab) ? 'unify-price text-xl lg:text-3xl -mt-2.5' : 'text-[#00CB20] text-xl ')}>
                        01 
                    </span>
                    <span className={cn('font-semibold', (tab === 'hotel-details' || !tab) ? 'text-white text-xs lg:text-sm' : 'text-[#00CB20] text-xs')}>
                        Hotel Details
                    </span>
                </div>
                <div className={cn('flex flex-1 items-center justify-center gap-2', (tab === 'hotel-details' || tab === 'verification') && 'max-lg:hidden')}>
                    <span className={cn('font-extrabold', (tab === 'booking-details' || !tab) ? 'unify-price text-xl lg:text-3xl -mt-2.5' : tab === 'hotel-details' ? 'text-[#CCCCCC] text-xl ' : 'text-[#00CB20] text-xl ')}>
                        02 
                    </span>
                    <span className={cn('font-semibold', (tab === 'booking-details') ? 'text-white text-xs lg:text-sm' : tab === 'hotel-details' ? 'text-[#808080] text-xs' : 'text-[#00CB20] text-xs ')}>
                        Booking Details
                    </span>
                </div>
                <div className={cn('flex flex-1 items-center justify-center gap-2', (tab === 'booking-details' || tab === 'hotel-details') && 'max-lg:hidden')}>
                    <span className={cn('font-extrabold', (tab === 'verification' || !tab) ? 'unify-price text-xl lg:text-3xl -mt-2.5' : 'text-[#CCCCCC] text-xl ')}>
                        03
                    </span>
                    <span className={cn('font-semibold', (tab === 'verification') ? 'text-white text-xs lg:text-sm' : 'text-[#808080] text-xs')}>
                        Verification
                    </span>
                </div>
            </div>
            <div className="px-12 flex-1 flex w-full flex-col bg-white">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4 py-4 w-full'>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className={cn("", tab !== 'hotel-details' && 'hidden absolute')}>
                                    <FormControl>
                                        <input 
                                            placeholder='Hotel Name' 
                                            className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem className={cn("", tab !== 'hotel-details' && 'hidden absolute')}>
                                    <FormControl>
                                        <input 
                                            placeholder='Hotel Website Link (Optional)' 
                                            className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                </FormItem>
                            )}
                        />
                        <div className={cn("flex w-full gap-2 max-lg:flex-col", tab !== 'hotel-details' && 'hidden absolute')}>
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className={cn("flex-1", tab !== 'hotel-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <input 
                                                placeholder='Address' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full outline-none rounded-md'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="zipCode"
                                render={({ field }) => (
                                    <FormItem className={cn("", tab !== 'hotel-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <input 
                                                placeholder='Zip Code' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full lg:max-w-[160px] outline-none rounded-md'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className={cn("flex w-full gap-2 max-lg:flex-col", tab !== 'hotel-details' && 'hidden absolute')}>
                            <FormField
                                control={form.control}
                                name="roomType"
                                render={({ field }) => (
                                    <FormItem className={cn("flex-1", tab !== 'hotel-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <input 
                                                placeholder='Room Type' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="boardType"
                                render={({ field }) => (
                                    <FormItem className={cn("flex-1", tab !== 'hotel-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <input 
                                                placeholder='Board Type' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className={cn("", tab !== 'hotel-details' && 'hidden absolute')}>
                                    <FormLabel className='font-poppins text-[#00000080] text-base font-normal'>Check In - Check Out</FormLabel>
                                    <FormControl>
                                        <div className={cn("grid gap-2")}>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                <Button
                                                    id="date"
                                                    variant={"outline"}
                                                    className={cn(
                                                    "w-full justify-start text-left font-normal text-black h-16 bg-white shadow-lg border border-[#0000001A] px-10",
                                                    !field.value?.from && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value?.from ? (
                                                    field.value.to ? (
                                                        <>
                                                        {format(field.value.from, "LLL dd, y")} -{" "}
                                                        {format(field.value.to, "LLL dd, y")}
                                                        </>
                                                    ) : (
                                                        format(field.value.from, "LLL dd, y")
                                                    )
                                                    ) : (
                                                    <span>Pick a date</span>
                                                    )}
                                                </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    initialFocus
                                                    mode="range"
                                                    defaultMonth={field.value?.from}
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    numberOfMonths={2}
                                                    disabled={(date) => {
                                                        return date < tomorrow;
                                                    }}
                                                />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                </FormItem>
                            )}
                        />
                        <div className={cn("flex w-full gap-2 max-lg:flex-col", tab !== 'hotel-details' && 'hidden absolute')}>
                            <FormField
                                control={form.control}
                                name="adults"
                                render={({ field }) => (
                                    <FormItem className={cn("flex-1", tab !== 'hotel-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <input 
                                                placeholder='Adults' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value.replace(/\D/g, ''))
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="children"
                                render={({ field }) => (
                                    <FormItem className={cn("flex-1", tab !== 'hotel-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <input 
                                                placeholder='Children' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value.replace(/\D/g, ''))
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {tab === 'booking-details' && <p className='my-4 text-center text-black font-poppins text-sm'>Please use the same details used to make hotel reservation!</p>}
                        {tab === 'verification' && <p className='my-4 text-center text-black font-poppins text-sm'>Please upload any verification that ensures that “ X Hotel” allows name & booking transfers from original buyer to new one. <br /> This step ensures a smooth and easy experience for both seller & buyer.</p>}
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem className={cn("", tab !== 'booking-details' && 'hidden absolute')}>
                                    <FormControl>
                                        <input 
                                            placeholder='Full Name' 
                                            className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                </FormItem>
                            )}
                        />
                        <div className={cn("flex w-full gap-2 max-lg:flex-col", tab !== 'booking-details' && 'hidden absolute')}>
                            <div className="flex-1 flex gap-2">
                                <FormField
                                    control={form.control}
                                    name="countryCode"
                                    render={({ field }) => (
                                        <FormItem className={cn("", tab !== 'booking-details' && 'hidden absolute')}>
                                            <FormControl>
                                                <select 
                                                    className='text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-4 w-full max-w-[100px] outline-none rounded-md'
                                                    {...field}
                                                >
                                                    <option value="+20">+20</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem className={cn("flex-1", tab !== 'booking-details' && 'hidden absolute')}>
                                            <FormControl>
                                                <input 
                                                    placeholder='Phone Number' 
                                                    className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full outline-none rounded-md'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className={cn("flex-1", tab !== 'booking-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <input 
                                                placeholder='Email' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="bookingMethod"
                            render={({ field }) => (
                                <FormItem className={cn("", tab !== 'booking-details' && 'hidden absolute')}>
                                    <FormControl>
                                        <input 
                                            placeholder='Booking Method' 
                                            className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                </FormItem>
                            )}
                        />
                        <div className={cn("flex w-full gap-2 max-lg:flex-col", tab !== 'booking-details' && 'hidden absolute')}>
                            <FormField
                                control={form.control}
                                name="itineraryNumber"
                                render={({ field }) => (
                                    <FormItem className={cn("flex-1", tab !== 'booking-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <input 
                                                placeholder='Itinerary Number' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem className={cn("flex-1", tab !== 'booking-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <input 
                                                placeholder='Price' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value === '' ? '' : /^-?\d*\.?\d*$/.test(e.target.value) ? e.target.value : field.value)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                    </FormItem>
                                )}
                            />
                        </div>  
                        {tab === 'verification' && (
                            <div onClick={() => fileInputRef.current?.click()} className='rounded-[6px] gap-4 flex items-center justify-center w-full bg-white shadow-[0px_0px_4px_2px_rgba(0,0,0,0.15)] py-4 px-6 font-poppins relative text-black outline-none cursor-pointer'>
                                <input onChange={handleUploadTicketsPdfs} className='hidden absolute w-full h-full' type='file' multiple={false} accept=".pdf,.jpg,.jpeg,.png" ref={fileInputRef} />
                                {uploadedProof ? (
                                    <Image
                                        src='/assets/uploadedCheck.svg'
                                        alt='upload'
                                        width={23}
                                        height={24} 
                                    />
                                ) : (
                                    <Image
                                        src='/assets/upload.svg'
                                        alt='upload'
                                        width={32}
                                        height={26} 
                                    />
                                )}
                                {uploadedProof ? (
                                    <div className='flex flex-col items-center justify-center'>
                                        <p className='font-light text-sm'>Proof Uploaded</p>
                                    </div>
                                ) : (
                                    <div className='flex flex-col items-center justify-center'>
                                        <p className='font-light text-sm'>Upload Verification</p>
                                        <p className='font-light text-[10px] text-[rgba(0,0,0,0.5)]'>PDF,JPG,JPEG,PNG</p>
                                    </div>
                                )}
                                {uploadedProof && <p onClick={(e) => {e.stopPropagation(); setUploadedProof(null)}} className='text-[rgba(0,0,0,0.5)] absolute top-[70%] right-[5%] underline text-[10px]'>Delete</p>}
                            </div>
                        )}
                        {tab === 'verification' && (
                            <div className='flex gap-1 text-black items-start justify-center'>
                                <Image
                                    src="/assets/bulb.svg"
                                    alt="bulb"
                                    width={17}
                                    height={17} 
                                />
                                <p className='font-poppins font-normal text-sm text-center'>
                                    Tip : Verification could be a screenshot from hotel’s policy, an e-mail thread etc....
                                </p>
                            </div>
                        )}
                        <div className='flex w-full items-center justify-between'>
                            {(tab === 'booking-details' || tab === 'verification') && (
                                <button disabled={loading} onClick={() => setTab(prev => prev === 'booking-details' ? 'hotel-details' : 'booking-details')} type='button' className='w-32 h-11 rounded-[4px] text-black border-[#00000080] border bg-[#EDEDED]'>
                                    Back
                                </button>
                            )}
                            {(tab === 'booking-details' || tab === 'hotel-details') && (
                                <button onClick={() => setTab(prev => prev === 'hotel-details' ? 'booking-details' : 'verification')} disabled={tab === 'hotel-details' ? !canNextFirstSection : !canNextSecondSection} type='button' className={cn('w-32 h-11 rounded-[4px] ml-auto text-white', (tab === 'hotel-details' ? canNextFirstSection : canNextSecondSection) ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'bg-[#A7A6A6]')}>
                                    Next
                                </button>
                            )}
                            {tab === 'verification' && (
                                <button disabled={!uploadedProof || loading} type='submit' className={cn('w-32 flex items-center justify-center gap-1 h-11 rounded-[4px] text-white', uploadedProof ? 'bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]' : 'bg-[#A7A6A6]', loading && 'opacity-65')}>
                                    {loading && <Loader2 className='w-6 h-6 animate-spin' />}
                                    Confirm
                                </button>
                            )}
                        </div>
                        {error && <p className='text-[#7F1D1D] font-poppins text-sm text-center'>{error}</p>}
                    </form>
                </Form>
            </div>
        </div>
    )
}