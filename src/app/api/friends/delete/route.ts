import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchRedis } from "@/lib/helpers/redis";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { removeFriendValidator } from "@/lib/validations/removeFriend";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        const { chatId, delete: toDeleteId } = removeFriendValidator.parse(body);
        const session = await getServerSession(authOptions);

        if(!session)
            return new NextResponse("Unauthorized", {status: 401});
        if(!toDeleteId)
            return new NextResponse("Missing delete Id", {status: 400});
        if(!chatId)
            return new NextResponse("Missing chat Id", {status: 400});

        const areFriends = (await fetchRedis("sismember", `user:${toDeleteId}:friends`, session.user.id)) as 0 | 1;

        if(!areFriends)
            return new NextResponse("You are not friends with this user", {status: 400});

        await Promise.all([
            pusherServer.trigger(
                toPusherKey(`user:${toDeleteId}:friends`),
                'remove_friend',
                session.user.id
            ),
            pusherServer.trigger(
                toPusherKey(`user:${session.user.id}:friends`),
                'remove_friend',
                toDeleteId
            ),
            db.del(`chat:${chatId}:messages`),
            db.srem(`user:${session.user.id}:friends`, toDeleteId),
            db.srem(`user:${toDeleteId}:friends`, session.user.id),
        ]);
        console.log(chatId)
        
        return new NextResponse('ok')
    } catch (error) {
        if(error instanceof z.ZodError)
            return new NextResponse("Malformed request", {status: 422});
        return new NextResponse("Internal Server Error", {status: 500});
    }
}
