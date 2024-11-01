import { initTranslations } from "@/lib/utils";
import { getUser } from "../layout";
import DigitalProductsForm from "./digital-products-form";

type Props = {
    params: { 
        locale?: string | undefined 
    }
}

export default async function DigitalProducts({ params }: Props)
{
    const { t } = await initTranslations(params.locale!, ['homepage'])

    const user = await getUser()

    return (
        <section className='flex flex-col items-center justify-center flex-1 gap-12 max-md:py-8 overflow-x-hidden px-6 md:px-20 text-white' key={Math.random()}>
            <div className="flex flex-col text-center items-center justify-center gap-1">
                <h1 className='font-bold font-poppins'>{t("sellProducts")}</h1>
                <h2 className='font-light font-poppins'>{t("fillForm")}</h2>
            </div>
            <DigitalProductsForm user={user!} locale={params.locale} />
        </section>
    )
}