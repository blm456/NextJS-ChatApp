'use client';

import { pusherClient } from '@/lib/pusher';
import { chatHrefConstructor, cn, toPusherKey } from '@/lib/utils';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SidebarChatLikstProps {
    friends: User[];
    sessionId: string;
}

interface ExtendedMessage extends Message {
    senderImg: string;
    senderName: string;
}

const SidebarChatList: FC<SidebarChatLikstProps> = ({friends, sessionId}) => {
    const router = useRouter();
    const pathname = usePathname();
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
    const [activeChats, setActiveChats] = useState<User[]>(friends);

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

        const newFriendsHandler = (newFriend: User) => {
            setActiveChats(prev => [...prev, newFriend]);
        }

        const chatHandler = (message: ExtendedMessage) => {
            const shouldNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;

            if(!shouldNotify) return;

            // TODO: Send custom toast
            toast.success(`New message from: ${message.senderName}`);
        }

        const friendRemoved = (removedId: string) => {
            console.log(`Friend removed!`)
            setActiveChats(prev => prev.filter(c => c.id !== removedId))
        }
        
        pusherClient.bind('new_message', chatHandler);
        pusherClient.bind('new_friend', newFriendsHandler);
        pusherClient.bind('remove_friend', friendRemoved);
        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));

            pusherClient.unbind('new_message', chatHandler);
            pusherClient.unbind('new_friend', newFriendsHandler);
            pusherClient.unbind('remove_friend', friendRemoved);

        }
    }, [pathname, sessionId, router]);

    useEffect(() => {
        if(pathname?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((msg) => pathname.includes(msg.senderId));
            })
        }
    }, [pathname]);

    return (
        <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1 select-none'>
            {activeChats.sort().map((friend) => {
                const unseenMessageCount = unseenMessages.filter((unseenMsg) => {
                    return unseenMsg.senderId === friend.id;
                }).length;

                const chatPath = `/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`;

                const isActive = chatPath === pathname;

                return (
                    <li key={friend.id}>
                        <a
                            href={chatPath}
                            className={cn(
                                'text-gray-700 hover:text-indigo-600 hover:bg-indigo-400/30 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold group',
                                isActive && "bg-indigo-500/30 text-indigo-600"
                            )}
                        >
                            <div className='w-8 h-8 relative'>
                                <Image
                                    fill
                                    src={friend.image}
                                    alt="Profile Photo"
                                    className={cn(
                                        'rounded-full group-hover:rounded-lg transition',
                                        isActive && "rounded-lg"
                                    )}
                                />
                            </div>
                            {friend.name}
                            {unseenMessageCount > 0 ? (
                                <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center'>
                                    {unseenMessageCount}
                                </div>
                            ) : null}
                        </a>
                    </li>
                )
            })}
        </ul>
    );
}

export default SidebarChatList;
