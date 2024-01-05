'use client';

import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { FC, useState } from 'react'
import Button from './ui/Button';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface DeleteFriendButtonProps {
    partner: User;
    chatId: string;
}

const DeleteFriendButton: FC<DeleteFriendButtonProps> = ({partner, chatId}) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await axios.post('/api/friends/delete', {
                delete: partner.id,
                chatId
            });
        } catch (error) {
            
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    }

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className='ml-auto mr-2 flex items-center justify-center p-2 rounded-md cursor-pointer group hover:bg-zinc-50 transition'
            >
                <Trash2 className='w-4 h-4 text-red-500 group-hover:text-red-900 transition' />
            </div>
            <div className={cn(
                'fixed top-0 left-0 h-full w-full z-[100] bg-zinc-50/40 flex items-center justify-center',
                !isOpen && 'hidden'
            )}>
                <div className='p-2 bg-white rounded-lg shadow-md z-[150]'>
                    <div className='p-4 text-center'>
                        <h1 className='text-xl font-bold'>Are your sure you want to delete {partner.name}?</h1>
                        <p className='text-sm text-zinc-500'>All messages will be deleted and they will need to confirm adding you again.</p>
                    </div>
                    <div className='flex items-center justify-between px-8'>
                        <Button
                            className='bg-red-600 text-white hover:bg-red-700'
                            onClick={handleDelete}
                        >Remove</Button>
                        <Button
                            onClick={() => setIsOpen(false)}
                        >Cancel</Button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DeleteFriendButton;
