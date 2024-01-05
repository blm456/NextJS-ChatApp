import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { FC } from 'react'

interface pageProps {
    
}

const page: FC<pageProps> = async ({}) => {
    const session = await getServerSession(authOptions);

    if(!session) return redirect('/login')

    return (
        <div className='h-full w-full flex items-center justify-center select-none'>
            <p className='text-sm text-muted'>
                Select a chat to continue
            </p>
        </div>
    );
}

export default page;
