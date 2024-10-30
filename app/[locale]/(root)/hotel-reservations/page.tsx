import { getUser } from "../layout";
import HotelReservationsForm from "./hotel-reservations-form";

export default async function HotelReservations()
{
    const user = await getUser()

    return (
        <section className='flex flex-col items-center justify-center flex-1 gap-12 overflow-x-hidden max-md:py-8 px-6 md:px-20 text-white' key={Math.random()}>
            <div className="flex flex-col text-center items-center justify-center gap-1">
                <h1 className='font-bold font-poppins'>Don’t Worry ! We’re here to help...</h1>
                <h2 className='font-light font-poppins'>Fill the form & sell your unused hotel reservations!</h2>
            </div>
            <HotelReservationsForm user={user!} />
        </section>
    )
}