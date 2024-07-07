export default function UserTicketsLoading()
{
    return (
        <div className='flex flex-col gap-4 w-full'>
            <div className='flex px-4 items-center justify-between'>
                <div className='w-1/5 h-5 rounded-sm bg-gray-500 opacity-75 animate-pulse' />
                <div className='w-1/5 h-5 rounded-sm bg-gray-500 opacity-75 animate-pulse' />
            </div>
            <div className='w-full min-h-[320px] rounded-sm bg-gray-500 opacity-75 animate-pulse' />
        </div>
    )
}