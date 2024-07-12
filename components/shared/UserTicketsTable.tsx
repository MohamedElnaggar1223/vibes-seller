'use client'

import { TicketType } from "@/lib/types/ticketTypes"
import { memo, useEffect, useMemo, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Checkbox } from "../ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import Image from "next/image"
import TicketPrice from "./TicketPrice"

type Props = {
    tickets: TicketType[]
}

export default function UserTicketsTable({ tickets }: Props) 
{
    const ticketsGroups = useMemo(() => {
        let ticketsCategories: { [key: string]: TicketType[] } = {}

        tickets.forEach(ticket => {
            const type = Object.keys(ticket.tickets)[0]
            if (!ticketsCategories[type]) {
                ticketsCategories[type] = []
            }

            ticketsCategories[type].push(ticket)
        })

        return ticketsCategories
    }, [tickets])

    const [ticketsSelect, setTicketsSelect] = useState(Object.keys(ticketsGroups).reduce((acc, key) => { acc[key] = []; return acc; }, {} as { [key: string]: TicketType[] }))
    const [confirmedTickets, setConfirmedTickets] = useState(false)
    const [sellingType, setSellingType] = useState<'individual' | 'bundle' | undefined>(undefined)
    const [choosePricesOpen, setChoosePricesOpen] = useState(false)
    const [ticketsSelectedWithPrice, setTicketsSelectedWithPrice] = useState<(TicketType & { salePrice: string })[]>([])

    const ticketsNumber = useMemo(() => Object.values(ticketsSelect).reduce((acc, tickets) => acc + tickets.length, 0), [ticketsSelect])

    useEffect(() => {
        setTicketsSelectedWithPrice(() => {
            let ticketsWithPrice: (TicketType & { salePrice: string })[] = []

            Object.entries(ticketsSelect).forEach(([key, tickets]) => {
                tickets.forEach(ticket => {
                    ticketsWithPrice.push({ ...ticket, salePrice: '0.00' })
                })
            })

            return ticketsWithPrice
        })
    }, [ticketsSelect])

    return (
        <div className='flex flex-col gap-4 w-full'>
            <Accordion type="multiple" className="w-full gap-8 flex flex-col">
                {Object.entries(ticketsGroups).map(([key, ticketsArray]) => (
                    <AccordionItem key={key} value={key} className="border-0">
                        <AccordionTrigger className='p-4 bg-black'>
                            <p className='font-poppins text-sm lg:text-base font-normal text-white'>
                                ({ticketsArray.length}) {key}
                            </p>
                            <div onClick={(e) => e.stopPropagation()} className="flex items-center space-x-2 ml-auto">
                                <Checkbox 
                                    checked={ticketsSelect[key].length === ticketsArray.length} 
                                    onCheckedChange={() => setTicketsSelect(prev => ({ ...prev, [key]: prev[key].length === ticketsArray.length ? [] : ticketsArray }))}
                                    id="selectAll" 
                                    className='bg-white font-poppins checked:bg-white aria-checked:bg-white min-w-5 min-h-5'
                                />
                                <label
                                    htmlFor="selectAll"
                                    className="text-sm lg:text-base font-poppins text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Select All
                                </label>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className='flex flex-wrap gap-4 mt-4'>
                                {ticketsArray.map(ticket => (
                                    <div key={ticket.id} className='flex rounded-sm items-center justify-between flex-[1_1_40%] bg-[rgba(0,0,0,0.4)] py-4 px-8 text-white'>
                                        <div className='flex items-center gap-4'>
                                            <Checkbox 
                                                checked={ticketsSelect[key].includes(ticket)} 
                                                onCheckedChange={() => setTicketsSelect(prev => ({ ...prev, [key]: prev[key].includes(ticket) ? prev[key].filter(t => t !== ticket) : [...prev[key], ticket] }))}
                                                id={ticket.id}
                                                className='min-w-6 min-h-6 bg-white'
                                            />
                                            <label
                                                htmlFor={ticket.id}
                                                className="text-base font-normal font-poppins leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {Object.keys(ticket.tickets)[0]}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <div className='w-full sticky bottom-0'>
                <div className='flex items-center justify-between pb-4'>
                    <div className='flex flex-col gap-1'>
                        <p className='font-poppins text-xs font-light text-white'>Have other tickets?</p>
                        <button className='px-10 py-3 bg-white rounded-sm text-black font-poppins text-xs font-medium'>Add ticket</button>
                    </div>
                    <div className='flex flex-col gap-1 items-center justify-center'>
                        <p className='font-poppins text-xs lg:text-sm font-extralight text-white'>({ticketsNumber}) Tickets Selected</p>
                        <button disabled={ticketsNumber === 0} onMouseDown={() => setConfirmedTickets(true)} className='px-8 py-4 disabled:opacity-65 bg-white rounded-sm text-black font-poppins text-xs lg:text-sm font-medium'>Confirm Selection</button>
                    </div>
                </div>
            </div>
            <Dialog open={confirmedTickets} onOpenChange={setConfirmedTickets}>
                <DialogContent className="sm:max-w-[512px] gap-8">
                    <DialogHeader className='flex items-center justify-center'>
                        <DialogTitle className='font-bold'>Do you want to sell ({ticketsNumber}) tickets as</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col items-start justify-center gap-4 w-screen max-w-[248px] mx-auto'>
                        <div className='flex items-center gap-4 w-full'>
                            <Checkbox 
                                checked={sellingType === 'individual'} 
                                onCheckedChange={() => setSellingType('individual')}
                                className='min-w-4 min-h-4 rounded-full bg-[#D9D9D9] outline-none border-none [&_svg]:stroke-none'
                                id='individual'
                            />
                            <label
                                htmlFor='individual'
                                className="text-base font-semibold font-poppins leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Individual Tickets
                            </label>
                        </div>
                        <div className='flex items-center gap-4 w-full'>
                            <Checkbox 
                                checked={sellingType === 'bundle'} 
                                onCheckedChange={() => setSellingType('bundle')}
                                className='min-w-4 min-h-4 rounded-full bg-[#D9D9D9] outline-none border-none [&_svg]:stroke-none'
                                id='bundle'
                            />
                            <label
                                htmlFor='bundle'
                                className="text-base font-semibold font-poppins leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Bundle
                            </label>
                        </div>
                    </div>
                    <DialogFooter className='flex w-full items-center justify-center'>
                        <button 
                            onClick={() => {
                                setConfirmedTickets(false)
                                setChoosePricesOpen(true)
                            }} 
                            disabled={!sellingType} 
                            className='px-10 py-4 text-white disabled:bg-[#A7A6A6] disabled:from-[#A7A6A6] disabled:to-[#A7A6A6] bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] rounded-sm font-poppins text-xs lg:text-sm font-medium mx-auto'
                        >
                            Confirm
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={choosePricesOpen} onOpenChange={setChoosePricesOpen}>
                <DialogContent>
                    <DialogHeader className='flex items-center justify-center gap-2'>
                        <h2 className="text-base font-semibold font-poppins leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Please set price for ({ticketsNumber}) tickets
                        </h2>
                        <div className='flex gap-1 items-start justify-center'>
                            <Image
                                src="/assets/bulb.svg"
                                alt="bulb"
                                width={17}
                                height={17} 
                            />
                            <p className='font-poppins font-normal text-sm text-center'>
                                Tip : we recommend you half the ticket/bundle price as this <br />
                                will increase the chances of being sold!
                            </p>
                        </div>
                    </DialogHeader>
                    <div className='flex flex-col gap-4'>
                        <p className='ml-auto underline font-poppins font-normal text-base text-center cursor-pointer'>
                            Unify Price
                        </p>
                        <div className='flex flex-col w-full gap-2 max-h-[480px] overflow-auto'>
                            {ticketsSelectedWithPrice.map((ticket, index) => <TicketPrice index={index} key={ticket.id} ticket={ticket} setTicketsSelectedWithPrice={setTicketsSelectedWithPrice} />)}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}