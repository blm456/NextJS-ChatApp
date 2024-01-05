import { Icons } from "@/components/Icons";
import { authOptions } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import Link from "next/link";

interface LandingLayoutProps {
    children: React.ReactNode,
    
}

export default async function LandingLayout({ children }: LandingLayoutProps) {
    const session = await getServerSession(authOptions);
    const isLoggedIn = (session != null)
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full flex items-center gap-x-2 p-2 shadow-md select-none">
                <div className="flex items-center gap-x-1">
                    <Icons.Logo className="w-8 h-8 text-indigo-600" />
                    <p className={cn(
                        "text-indigo-600 font-bold"
                    )}>FriendZone</p>
                </div>
                <div className="ml-auto flex items-center gap-x-2">
                    {isLoggedIn ? (
                        <>
                            <Link
                                href='/dashboard'
                                className="rounded bg-indigo-600 text-white p-1.5 text-sm hover:bg-indigo-800"
                            >
                                Enter App
                            </Link>
                        </>
                    ) : (
                        <Link
                            href='/login'
                            className="rounded bg-indigo-600 text-white p-1.5 text-sm hover:bg-indigo-800"
                        >
                            Login or Sign Up
                        </Link>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}
