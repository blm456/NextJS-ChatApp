"use client";

import GoogleLogo from '@/components/svg/GoogleLogo';
import Button from '@/components/ui/Button';
import { FC, useState } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

interface pageProps {
    
}

const page: FC<pageProps> = ({}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const loginWithGoogle = () => {
        setIsLoading(true);
        const signInPromise = signIn('google').finally(() => {
            setIsLoading(false);
        });
        toast.promise(signInPromise, {
            loading: "Logging in with Google...",
            success: "Redirecting...",
            error: "Something went wrong with your login!"
        });
    }

    return (
        <>
            <div className='flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 '>
                <div className='w-full flex flex-col items-center max-w-md space-y-8'>
                    <div className='flex flex-col items-center gap-8'>
                        logo
                        <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>Sign in to your account</h2>
                    </div>
                    <Button
                        isLoading={isLoading}
                        hoverGrow='off'
                        type='button'
                        className='max-w-sm mx-auto w-full'
                        onClick={loginWithGoogle}
                    >
                        {!isLoading && <GoogleLogo />}
                        Google
                    </Button>
                </div>
            </div>
        </>
    );
}

export default page;
