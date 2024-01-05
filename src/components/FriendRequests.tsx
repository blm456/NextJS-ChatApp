'use client';

import { pusherClient } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';
import axios from 'axios';
import { Check, UserPlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react'

interface FriendRequestsProps {
    incomingFriendRequests: IncomingFriendRequest[],
    sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({incomingFriendRequests, sessionId}) => {
    const router = useRouter();
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests);

    useEffect(() => {
        pusherClient.subscribe(
            toPusherKey(`user:${sessionId}:incoming_friend_request`)
        );

        const friendRequestHandler = ({imageUrl, senderEmail, senderId}: IncomingFriendRequest) => {
            setFriendRequests(prev => [...prev, {senderId, senderEmail, imageUrl}]);
        }

        pusherClient.bind('incoming_friend_request', friendRequestHandler);

        return () => {
            pusherClient.unsubscribe(
                toPusherKey(`user:${sessionId}:incoming_friend_request`)
            );
            pusherClient.unbind('incoming_friend_request', friendRequestHandler);
        }
    }, [sessionId]);

    const respondFriend = async (senderId: string, accept: boolean) => {
        await axios.patch('/api/friends/add', { id: senderId, accepted: accept });
        setFriendRequests(prev => prev.filter(i => i.senderId !== senderId));
        router.refresh();
    }

    return (
        <>
            {friendRequests.length === 0 ? (
                <p className='text-sm text-zinc-500'>Nothing to show here...</p>
            ): friendRequests.map((request) => (
                <div key={request.senderId} className='flex gap-4 items-center'>
                    <UserPlus className='text-black' />
                    <p className='font-medium text-lg'>{request.senderEmail}</p>
                    <button
                        onClick={() => respondFriend(request.senderId, true)}
                        aria-label='Accept Friend'
                        className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md'
                    >
                        <Check className='font-semibold text-white w-3/4 h-3/4' />
                    </button>

                    <button
                        onClick={() => respondFriend(request.senderId, false)}
                        aria-label='Deny Friend'
                        className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-m'
                    >
                        <X className='font-semibold text-white w-3/4 h-3/4' />
                    </button>
                </div>
            ))}
        </>
    );
}

export default FriendRequests;
