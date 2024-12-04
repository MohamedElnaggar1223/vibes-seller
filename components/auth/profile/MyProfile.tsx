'use client'

import { UserType } from "@/lib/types/userTypes"
import { Suspense, startTransition, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "../../ui/dialog"
import { Loader2 } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import PersonalInformation from "./PersonalInformation"
import ChangePassword from "./ChangePassword"
import InfoLoading from "./tickets/InfoLoading"
import { useTranslation } from "react-i18next"

type Props = {
    user: UserType
    params: {
        locale?: string | undefined
    }
}

export default function MyProfile({ user, params }: Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    // const [selectedTab, setSelectedTab] = useState('personal')
    const searchParams = useSearchParams()
    const router = useRouter()
    const selectedTab = searchParams?.get('show') ?? 'personal'
    const [currentWidth, setCurrentWidth] = useState<number>()

    const { t } = useTranslation()
    const pathname = usePathname()

    useEffect(() => {
        if (window) setCurrentWidth(window?.innerWidth!)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (loading) {
                event.preventDefault()
                event.stopPropagation()
            }
        }

        window.addEventListener('click', handleClickOutside)

        return () => {
            window.removeEventListener('click', handleClickOutside)
        }
    }, [loading])

    useEffect(() => {
        if (success !== '') setTimeout(() => setSuccess(''), 3000)
    }, [success])

    useEffect(() => {
        if (error !== '') setTimeout(() => setError(''), 3000)
    }, [error])

    useEffect(() => {
        const handleResize = () => setCurrentWidth(window.innerWidth)
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return (
        <section dir={pathname?.includes('/ar') ? 'rtl' : 'ltr'} className='flex w-full min-h-[90vh] max-h-[90vh] items-center justify-center lg:gap-16 lg:px-24'>
            {
                (currentWidth ?? 0) > 1024 && (
                    <div className='flex flex-1 flex-col max-w-[19rem] items-center justify-center rounded-lg divide-y-[1px]'>
                        <div
                            onClick={() => {
                                startTransition(() => {
                                    router.push('?show=personal', { scroll: false })
                                })
                            }}
                            className='py-8 min-w-[19rem] flex items-center justify-center rounded-t-lg bg-[rgba(82,82,82,0.60)] cursor-pointer'
                        >
                            <p className={cn('font-poppins text-base font-normal text-white', !(selectedTab === 'change-password' || selectedTab === 'my-tickets' || selectedTab === 'hotel-reservations' || selectedTab === 'digital-products') && 'bg-[linear-gradient(90deg,rgba(231,35,119,1)50%,rgba(235,94,27,1)100%)] text-transparent bg-clip-text')}>{t('personalInformation')}</p>
                        </div>
                        {
                            user.provider === 'credentials' &&
                            <div
                                onClick={() => {
                                    startTransition(() => {
                                        router.push('?show=change-password', { scroll: false })
                                    })
                                }}
                                className='py-8 min-w-[19rem] flex items-center justify-center bg-[rgba(82,82,82,0.60)] cursor-pointer'
                            >
                                <p className={cn('font-poppins text-base font-normal text-white', selectedTab === 'change-password' && 'bg-[linear-gradient(90deg,rgba(231,35,119,1)50%,rgba(235,94,27,1)100%)] text-transparent bg-clip-text')}>{t('changePassword')}</p>
                            </div>
                        }
                    </div>
                )
            }
            {
                selectedTab === 'personal' ? (
                    <Suspense fallback={<InfoLoading />}>
                        <PersonalInformation user={user} setLoading={setLoading} setError={setError} setSuccess={setSuccess} />
                    </Suspense>
                ) : selectedTab === 'change-password' ? (
                    <Suspense fallback={<>Loading...</>}>
                        <ChangePassword user={user} setLoading={setLoading} setError={setError} setSuccess={setSuccess} />
                    </Suspense>
                ) : (
                    <Suspense fallback={<InfoLoading />}>
                        <PersonalInformation user={user} setLoading={setLoading} setError={setError} setSuccess={setSuccess} />
                    </Suspense>
                )
            }

            {/* <div className='flex-1' /> */}
            <Dialog open={loading}>
                <DialogContent className='flex items-center justify-center bg-transparent border-none outline-none'>
                    <Loader2 className='animate-spin' size={42} color="#5E1F3C" />
                </DialogContent>
            </Dialog>
            <Dialog open={success.length > 0}>
                <DialogContent className='flex items-center justify-center bg-transparent border-none outline-none'>
                    <Loader2 className='animate-spin' size={42} color="#5E1F3C" />
                </DialogContent>
            </Dialog>
            <Dialog open={error !== ''}>
                <DialogContent className='flex items-center justify-center bg-white border-none outline-none text-center'>
                    <p className='text-black mt-2 font-poppins text-lg font-semibold text-center'>{error}</p>
                </DialogContent>
            </Dialog>
            <Dialog open={success !== ''}>
                <DialogContent className='flex items-center justify-center bg-white border-none outline-none text-center'>
                    <p className='text-black mt-2 font-poppins text-lg font-semibold text-center'>{success}</p>
                </DialogContent>
            </Dialog>
        </section>
    )
}