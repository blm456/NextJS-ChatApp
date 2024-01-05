import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchRedis } from "@/lib/helpers/redis";
import { pusherServer } from "@/lib/pusher";
import { pv, toPusherKey } from "@/lib/utils";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {z} from 'zod';

// Create Friend Request
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        const {email: emailToAdd} = addFriendValidator.parse(body.email);

        const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`) as string;
        const session = await getServerSession(authOptions);

        if(!session)
            return new NextResponse("Unauthorized", {status: 401});
        if(!idToAdd)
            return new NextResponse("This person does not exist", {status: 400});
        if(idToAdd === session.user.id)
            return new NextResponse("You cannot add yourself", {status: 400});

        const isAlreadyAdded = (await fetchRedis("sismember", `user:${idToAdd}:incoming_friend_request`, session.user.id)) as 0 | 1;

        const isAlreadyFriends = (await fetchRedis("sismember", `user:${idToAdd}:friends`, session.user.id)) as 0 | 1;

        const hasAddedYou = (await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_request`, idToAdd)) as 0 | 1;
        if(hasAddedYou)
            return new NextResponse("This person has added you. Check your friend requests.", {status: 400});
        if(isAlreadyAdded)
            return new NextResponse("Already added this user", {status: 400});
        if(isAlreadyFriends)
            return new NextResponse("You are already friends with this person", {status: 400})

        await pusherServer.trigger(
            toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
            'incoming_friend_request',
            {
                senderId: session.user.id,
                senderEmail: session.user.email,
                imageUrl: session.user.image
            }
        )
        console.log('Trigger request')

        await db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

        return new NextResponse("ok", {status: 200});

    } catch (error) {
        if(error instanceof z.ZodError)
            return new NextResponse("Malformated email", {status: 422});
        console.log(error)
        return new NextResponse("Internal server error caused by client speciffically", {status: 400});
    }
}

// Respond to request
export const PATCH = async (request: NextRequest) => {
    try {
        const body = await request.json();
    
        const { id: idToARespond, accepted: shouldAccept } = z.object({
            id: z.string(), 
            accepted: z.boolean() 
        }).parse(body);
        
        const session = await getServerSession(authOptions);
    
        if(!session)
            return new NextResponse("Unauthorized", {status: 401});
    
        const isAlreadyFriends = await fetchRedis(
            'sismember', `user:${session.user.id}:friends`, idToARespond
        );
        if(isAlreadyFriends)
            return new NextResponse("You are already friends", {status: 400});
    
        const hasFriendRequest = await fetchRedis(
            'sismember',
            `user:${session.user.id}:incoming_friend_requests`,
            idToARespond
        )
        
        if (!hasFriendRequest)
            return new Response('No friend request', { status: 400 });
        
        if(shouldAccept) {
            const [userRaw, friendRaw] = (await Promise.all([
                fetchRedis('get', `user:${session.user.id}`),
                fetchRedis('get', `user:${idToARespond}`),
            ])) as [string, string]
            
            const user = JSON.parse(userRaw) as User
            const friend = JSON.parse(friendRaw) as User

            await Promise.all([
                pusherServer.trigger(
                    toPusherKey(`user:${idToARespond}:friends`),
                    'new_friend',
                    user
                ),
                pusherServer.trigger(
                    toPusherKey(`user:${session.user.id}:friends`),
                    'new_friend',
                    friend
                ),
                db.sadd(`user:${session.user.id}:friends`, idToARespond),
                db.sadd(`user:${idToARespond}:friends`, session.user.id),
                db.srem(`user:${session.user.id}:incoming_friend_requests`, idToARespond),
            ]);
        } else {
            await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToARespond);
            await pusherServer.trigger(
                toPusherKey(`user:${session.user.id}:friends`),
                'deny_friend', ""
            )
        }
      
        return new Response('OK')
    } catch (error) {
        console.log(error);

        if (error instanceof z.ZodError) {
            return new Response('Invalid request payload', { status: 422 })
        }
      
        return new Response('Invalid request', { status: 400 })
    }
}

// Returns a count of friend requests
export const GET = async () => {
    try {
        const session = await getServerSession(authOptions);
    
        if(!session)
            return new NextResponse("Unauthorized", {status: 401});
        const unseenRequestCount = ((await fetchRedis(
            'smembers',
            `user:${session.user.id}:incoming_friend_requests`,
        )) as User[]).length;

        return NextResponse.json({count: unseenRequestCount})
    } catch (error) {
        
    }
}
