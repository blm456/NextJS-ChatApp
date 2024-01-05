import FriendRequests from "@/components/FriendRequests";
import { authOptions } from "@/lib/auth";
import { fetchRedis } from "@/lib/helpers/redis";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

const page = async () => {
    const session = await getServerSession(authOptions);
    if(!session) return notFound();

    const incomingServerIds = (await fetchRedis(
        'smembers', `user:${session.user.id}:incoming_friend_requests`
    )) as string[];

    const incomingFriendsRequests = await Promise.all(
        incomingServerIds.map(async (senderId) => {
            const sender = (await fetchRedis('get', `user:${senderId}`));
            const senderParsed = JSON.parse(sender) as User;

            return {
                senderId,
                senderEmail: senderParsed.email,
                imageUrl: senderParsed.image
            } as IncomingFriendRequest
        })
    )

    return (
        <main className="pt-8">
            <h1 className="font-bold text-5xl mb-8">Incoming Requests</h1>
            <div className="flex flex-col gap-4">
                <FriendRequests
                    sessionId={session.user.id}
                    incomingFriendRequests={incomingFriendsRequests}
                />
            </div>
        </main>
    );
}

export default page;
