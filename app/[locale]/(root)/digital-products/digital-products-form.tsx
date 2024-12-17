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
    FormMessage,
} from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { useRef, useState } from "react"
import { db } from "@/firebase/client/config"
import { collection, doc, runTransaction } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { UserType } from "@/lib/types/userTypes"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const digitalProductSchema = z.object({
    title: z.string().min(3, {
        message: 'Title must be at least 3 characters long'
    }),
    role: z.enum(['Seller', 'Buyer', 'Broker (Transaction Confidential)', 'Broker (Transaction Transparent for Buyer and  Seller)', '']),
    itemName: z.string().min(3, {
        message: 'Item Name must be at least 3 characters long'
    }),
    inspectionPeriod: z.string().min(3, {
        message: 'required'
    }),
    itemCategory: z.enum(['', 'Vehicles']),
    price: z.string().refine((adults) => parseInt(adults) >= 1, {
        message: 'price must be at least 1'
    }),
    currency: z.enum(['EGP', 'USD', 'SAR', 'AED', '']),
    itemDescription: z.string().min(3, {
        message: 'Item description must be at least 3 characters long'
    }),
    notes: z.string().optional()
})

export default function DigitalProductsForm({ user, locale }: { user: UserType, locale: string | undefined }) {
    const router = useRouter()

    const btnRef = useRef<HTMLButtonElement>(null)

    const [tab, setTab] = useState<'digitalProduct-details' | 'booking-details' | 'verification'>('digitalProduct-details')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [warningOpen, setWarningOpen] = useState(false)

    const form = useForm<z.infer<typeof digitalProductSchema>>({
        resolver: zodResolver(digitalProductSchema),
        defaultValues: {
            title: '',
            price: '',
            currency: '',
            itemCategory: '',
            itemDescription: '',
            itemName: '',
            notes: '',
            role: '',
            inspectionPeriod: ''
        },
    })

    async function onSubmit(values: z.infer<typeof digitalProductSchema>) {
        setLoading(true)

        if (!values.role) {
            form.setError('role', {
                message: 'Role is required'
            })
            setLoading(false)
            return
        }

        if (!values.currency) {
            form.setError('currency', {
                message: 'Currency is required'
            })
            setLoading(false)
            return
        }

        if (!values.itemCategory) {
            form.setError('itemCategory', {
                message: 'Item Category is required'
            })
            setLoading(false)
            return
        }

        try {
            await runTransaction(db, async (transaction) => {
                const digitalProductDoc = doc(collection(db, "digitalProducts"))

                const addedDigitalProduct = {
                    ...values,
                    status: 'pending',
                    userId: user.id,
                    id: digitalProductDoc.id,
                }

                await transaction.set(digitalProductDoc, addedDigitalProduct)
            })

            router.push('/dashboard?tab=digital-products')
        }
        catch (e: any) {
            setError(e?.message ?? 'Something went wrong')
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-screen max-w-full lg:max-w-[720px] flex flex-col rounded-[20px] overflow-hidden'>
            <div className="px-12 flex-1 flex w-full flex-col bg-white">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-6 py-4 w-full'>
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className={cn("", tab !== 'digitalProduct-details' && 'hidden absolute')}>
                                    <FormControl>
                                        <input
                                            placeholder={locale === 'ar' ? "عنوان المعاملة" : 'Transaction Title'}
                                            className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute font-poppins text-[#7F1D1D] text-xs" />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-2 max-lg:flex-col">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem className={cn("flex-1", tab !== 'digitalProduct-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <select
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                                {...field}
                                            >
                                                <option disabled value="">{locale === 'ar' ? "الدور" : 'Role'}</option>
                                                <option value="Seller">{locale === 'ar' ? "بائع" : 'Seller'}</option>
                                                <option value="Buyer">{locale === 'ar' ? "مشتري" : 'Buyer'}</option>
                                                <option value="Broker (Transaction Confidential)">{locale === 'ar' ? "متصل (المعاملة مخفية)" : 'Broker (Transaction Confidential)'}</option>
                                                <option value="Broker (Transaction Transparent for Buyer and  Seller)">{locale === 'ar' ? "متصل (المعاملة شائعة للمشتري والبائع)" : 'Broker (Transaction Transparent for Buyer and  Seller)'}</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D] text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="inspectionPeriod"
                                render={({ field }) => (
                                    <FormItem className={cn("lg:max-w-[218px]", tab !== 'digitalProduct-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <input
                                                placeholder={locale === 'ar' ? "فترة الفحص" : 'Inspection Period'}
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D] max-w-[200px] text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className={cn("flex w-full gap-2 max-lg:flex-col", tab !== 'digitalProduct-details' && 'hidden absolute')}>
                            <FormField
                                control={form.control}
                                name="itemName"
                                render={({ field }) => (
                                    <FormItem className={cn("flex-1", tab !== 'digitalProduct-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <input
                                                placeholder={locale === 'ar' ? "اسم العنصر" : 'Item Name'}
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full outline-none rounded-md'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D] text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="itemCategory"
                                render={({ field }) => (
                                    <FormItem className={cn("flex-1", tab !== 'digitalProduct-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <select
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full outline-none rounded-md'
                                                {...field}
                                            >
                                                <option disabled value="">{locale === 'ar' ? "فئة العنصر" : 'Item Category'}</option>
                                                <option value="Vehicles">{locale === 'ar' ? "مركبات" : 'Vehicles'}</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D] text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className={cn("flex w-full gap-2 max-lg:flex-col", tab !== 'digitalProduct-details' && 'hidden absolute')}>
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem className={cn("flex-1", tab !== 'digitalProduct-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <input
                                                placeholder={locale === 'ar' ? "السعر" : 'Price'}
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value === '' ? '' : /^-?\d*\.?\d*$/.test(e.target.value) ? e.target.value : field.value)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D] text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem className={cn("flex-1", tab !== 'digitalProduct-details' && 'hidden absolute')}>
                                        <FormControl>
                                            <select
                                                className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                                {...field}
                                            >
                                                <option disabled value="">{locale === 'ar' ? "العملة" : 'Currency'}</option>
                                                <option value="EGP">{locale === 'ar' ? "جنيه" : 'EGP'}</option>
                                                <option value="USD">{locale === 'ar' ? "دولار أمريكي" : 'USD'}</option>
                                                <option value="SAR">{locale === 'ar' ? "ريال سعودي" : 'SAR'}</option>
                                                <option value="AED">{locale === 'ar' ? "درهم إمارات" : 'AED'}</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage className="absolute font-poppins text-[#7F1D1D] text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="itemDescription"
                            render={({ field }) => (
                                <FormItem className={cn("")}>
                                    <FormControl>
                                        <textarea
                                            placeholder={locale === 'ar' ? "وصف العنصر" : 'Item Description'}
                                            className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                            {...field}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute font-poppins text-[#7F1D1D] text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem className={cn("")}>
                                    <FormControl>
                                        <textarea
                                            placeholder={locale === 'ar' ? "ملاحظات (اختيارية)" : 'Notes (optional)'}
                                            className='placeholder:text-[rgba(0,0,0,0.5)] text-black shadow-lg border border-[#0000001A] font-poppins py-5 text-base px-10 w-full max-sm:max-w-[340px] outline-none rounded-md'
                                            {...field}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute font-poppins text-[#7F1D1D] text-xs" />
                                </FormItem>
                            )}
                        />
                        <div className='flex w-full items-center justify-end'>
                            <button disabled={loading} type='button' onClick={() => setWarningOpen(true)} className={cn('w-32 flex items-center justify-center gap-1 h-11 rounded-[4px] text-white bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%]', loading && 'opacity-65')}>
                                {loading && <Loader2 className='w-6 h-6 animate-spin' />}
                                {locale === 'ar' ? "تأكيد" : 'Confirm'}
                            </button>
                        </div>
                        <button type='submit' className='hidden' ref={btnRef} />
                        <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
                            <DialogContent className='flex flex-col text-center !bg-white items-center justify-center bg-transparent border-none outline-none'>
                                {locale === 'ar' ? 'عند الموافقة على بيع منتجك، ستحتفظ Vibes بأموالك وسيتم تحريرها في حسابك البنكي بمجرد انتهاء فترة الفحص أو عند انتهاء المشترين من تأكيد تطابق المنتجات مع تفاصيل القائمة. عادةً ما يستغرق تحويل الأموال إلى الحساب البنكي للبائع من 15 إلى 20 يومًا.' : "Upon agreeing to sell your product, your money will be held by Vibes and released into your bank account once inspection period ends or upon confirmation from buyers end that products matches details of listing. Funds usually takes 15-20 days to be released into sellers bank account."}
                                <div className='flex items-center justify-center gap-2 mt-4'>
                                    <button onClick={() => setWarningOpen(false)} className='bg-[#E72377] rounded-[4px] font-light py-3 flex-1 text-sm max-w-[160px] w-screen px-6 text-white font-poppins'>{locale === 'ar' ? "التخلي عن المعاملة" : 'Decline'}</button>
                                    <button onClick={() => { setWarningOpen(false); btnRef.current?.click() }} className='bg-white rounded-[4px] font-light py-3 flex-1 text-sm max-w-[160px] w-screen px-6 text-black font-poppins'>{locale === 'ar' ? "الموافقة على المعاملة" : 'Agree'}</button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        {error && <p className='text-[#7F1D1D] font-poppins text-sm text-center'>{error}</p>}
                    </form>
                </Form>
            </div>
        </div>
    )
}