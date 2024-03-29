import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { db } from "./db";
import { pv } from "./utils";

export const authOptions: NextAuthOptions = {
    adapter: UpstashRedisAdapter(db),
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/login'
    },
    providers: [
        GoogleProvider({
            clientId: pv("GOOGLE_CLIENT_ID"),
            clientSecret: pv("GOOGLE_CLIENT_SECRET")
        })
    ],
    callbacks: {
        async jwt({token, user}) {
            const dbUser = (await db.get(`user:${token.id}`)) as User | null;

            if(!dbUser) {
                token.id = user!.id;
                return token;
            }

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                image: dbUser.image
            }
        },
        async session({session, token}) {
            if(token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.image;
            }
            return session;
        },
        redirect() {
            return '/dashboard'
        }
    }
}