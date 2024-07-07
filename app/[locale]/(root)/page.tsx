import Search from "@/components/Homepage/Search/Search";
import SearchLoading from "@/components/Homepage/Search/SearchLoading";
import SearchBar from "@/components/shared/SearchBar";
import { initAdmin } from "@/firebase/server/config";
import { getCategories, getEvents } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

type Props = {
	params: {
		locale?: string | undefined
	}
	searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Home({ searchParams, params }: Props)
{
	const categories = await getCategories()
	const events = await getEvents()

	const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
	const date = typeof searchParams.date === 'string' ? searchParams.date : undefined
	const country = typeof searchParams.country === 'string' && (searchParams.country === 'UAE' || searchParams.country === 'Egypt' || searchParams.country === 'KSA') ? searchParams.country : undefined
	const category = typeof searchParams.category === 'string' ? searchParams.category : undefined
	
	return (
		<section className='flex flex-col items-center justify-center flex-1 gap-8 overflow-x-hidden px-6 md:px-20' key={Math.random()}>
			<SearchBar locale={params?.locale} />
			{
				(search || date || country || category) ? (
					<Suspense fallback={<SearchLoading />}>
						<Search locale={params?.locale} search={search} date={date} category={category} country={country} categories={categories} />
					</Suspense>
				) : (
					<div className='flex items-start justify-start mb-auto flex-wrap gap-8'>
						{events.map(event => (
							<div key={event.id} className='max-lg:max-w-32 max-lg:min-h-32 lg:min-w-48 lg:min-h-48 rounded-lg overflow-hidden'>
								<Link
									href={`/${event.id}`}
								>
									<Image
										src={event?.displayPageImage}
										width={192} 
										height={192} 
										alt={event.name}
										className='object-cover max-lg:max-w-32 max-lg:min-h-32 lg:min-w-48 lg:min-h-48 cursor-pointer hover:scale-105 transition-transform duration-300 ease-in-out rounded-lg'
										loading="lazy"
									/>
								</Link>
							</div>
						))}
					</div>
				)
			}
		</section>
	)
}
