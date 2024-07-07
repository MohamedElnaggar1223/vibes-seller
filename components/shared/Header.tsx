import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import SignedInHeader from "./SignedInHeader";
import CategoriesHeaderLink from "./CategoriesHeaderLink";
import { getCategories, initTranslations } from "@/lib/utils";
import LocaleSwitcher from "./LocaleSwitcher";
import { unstable_noStore as noStore } from "next/cache";
import { initAdmin } from "@/firebase/server/config";
import { UserType } from "@/lib/types/userTypes";
import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";

type Props = {
    params: {
        locale?: string
    }
}

const getUser = async () => {
    const admin = await initAdmin()
    const cookiesData = cookies()
    const token = await decode({ token: cookiesData.get(process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token')?.value, secret: process.env.NEXTAUTH_SECRET! })
    if(token?.sub)
    {
      const user = (await admin.firestore().collection('users')?.doc(token?.sub as string).get()).data()
      const userClient = {...user, cart: user?.cart && user?.cart.tickets.length ? {...user.cart, createdAt: user.cart?.createdAt?.toDate()} : undefined} as UserType
  
      return userClient
    }
    return null
}

export default async function Header({ params }: Props) 
{
    noStore()
    const { t } = await initTranslations(params?.locale ?? 'en', ['homepage', 'common'], )
    const session = await getServerSession()
    const categories = await getCategories()
    const user = await getUser()

    return (
        <header dir={params.locale === 'ar' ? 'rtl' : 'ltr'} className='py-2 lg:px-20 min-w-full flex justify-between items-center sticky top-0 z-[99999999999] bg-black'>
            <Link href='/'>
                <Image
                    src="/assets/logo.png"
                    width={195}
                    height={73}
                    alt="logo"
                    className='cursor-pointer max-lg:w-[120px] max-lg:h-[45px]'
                    priority
                />
            </Link>
            <div className="flex gap-6 lg:gap-24 items-center max-lg:mr-4">
                <CategoriesHeaderLink categories={categories} />
                {/* <Link href='/' className='text-white font-poppins text-lg font-[300]'>
                    Sell Your Tickets
                </Link> */}
                <LocaleSwitcher params={params} />
                {
                    !session?.user || !user?.id ? (
                        <Link href='/sign-in'>
                            <button className='font-poppins text-sm md:text-[16px] bg-gradient-to-r from-[#E72377] from-[-5.87%] to-[#EB5E1B] to-[101.65%] rounded-full px-3 py-1 md:px-6 md:py-2 text-white'>
                                {t('common:sign-in')}
                            </button>
                        </Link>
                    ) : (
                        <SignedInHeader user={user!} />
                    )
                }
            </div>
        </header>
    )
}
