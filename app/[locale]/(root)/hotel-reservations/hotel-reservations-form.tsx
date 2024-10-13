'use client'

import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

const hotelReservationSchema = z.object({
    name: z.string().min(3, {
        message: 'Name must be at least 3 characters long'
    }),
    website: z.string().url({
        message: 'Website must be a valid URL'
    }),
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
    }).refine(({ from, to }) => from < to, {
        message: 'Check out date must be after check'
    }).refine(({ from }) => from > new Date(), {
        message: 'Check in date must be in the future'
    }).refine(({ to }) => to > new Date(), {
        message: 'Check out date must be in the future'
    }),
    adults: z.string().refine((adults) => parseInt(adults) >= 0, {
        message: 'Adults must be at least 0'
    }),
    children: z.string().optional().refine((children) => children ? parseInt(children) >= 0 : true, {
        message: 'Children must be at least 0'
    }),
})

export default function HotelReservationsForm()
{
    const searchParams = useSearchParams()
    const tab = searchParams?.get('tab')

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
                from: new Date(),
                to: new Date()
            },
            adults: '',
            children: '',
        },
    })
    
    function onSubmit(values: z.infer<typeof hotelReservationSchema>) {
    }

    form.watch('date')

    console.log("from: ", form.getValues("date.from"))
    console.log("to: ", form.getValues("date.to"))

    return (
        <div className='w-screen max-w-[627px] flex flex-col rounded-[20px] overflow-hidden'>
            <div className='flex items-center justify-center w-full bg-black pb-4 pt-6 px-4 divide-x !divide-[#808080]'>
                <div className={cn('flex flex-1 items-center justify-center gap-2')}>
                    <span className={cn('font-extrabold', (tab === 'hotel-details' || !tab) ? 'unify-price text-3xl -mt-2.5' : 'text-[#CCCCCC] text-xl ')}>
                        01 
                    </span>
                    <span className={cn('font-semibold', (tab === 'hotel-details' || !tab) ? 'text-white text-sm' : 'text-[#808080] text-xs')}>
                        Hotel Details
                    </span>
                </div>
                <div className='flex flex-1 items-center justify-center gap-2'>
                    <span className='text-[#CCCCCC] text-xl font-extrabold'>
                        01 
                    </span>
                    <span className='text-[#808080] text-xs font-semibold'>
                        Hotel Details
                    </span>
                </div>
                <div className='flex flex-1 items-center justify-center gap-2'>
                    <span className='text-[#CCCCCC] text-xl font-extrabold'>
                        01 
                    </span>
                    <span className='text-[#808080] text-xs font-semibold'>
                        Hotel Details
                    </span>
                </div>
            </div>
            <div className="px-8 flex-1 flex w-full bg-white">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4 p-4 w-full'>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="">
                                    <FormControl>
                                        <input 
                                            placeholder='Hotel Name' 
                                            className='placeholder:text-[rgba(0,0,0,0.5)] shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
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
                                <FormItem className="">
                                    <FormControl>
                                        <input 
                                            placeholder='Hotel Name' 
                                            className='placeholder:text-[rgba(0,0,0,0.5)] shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                </FormItem>
                            )}
                        />
                        <div className="flex w-full gap-2">
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <input 
                                                placeholder='Address' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full outline-none rounded-md'
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
                                    <FormItem className="">
                                        <FormControl>
                                            <input 
                                                placeholder='Zip Code' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-w-[160px] outline-none rounded-md'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex w-full gap-2">
                            <FormField
                                control={form.control}
                                name="roomType"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <input 
                                                placeholder='Room Type' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
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
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <input 
                                                placeholder='Board Type' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
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
                                <FormItem className="">
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
                                                />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                </FormItem>
                            )}
                        />
                        <div className="flex w-full gap-2">
                            <FormField
                                control={form.control}
                                name="adults"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <input 
                                                placeholder='Adults' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                                {...field}
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
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <input 
                                                placeholder='Children' 
                                                className='placeholder:text-[rgba(0,0,0,0.5)] shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}