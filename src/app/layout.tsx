import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: {
        default: "FriendZone",
        template: "%s | FreindZone"
    },
    description: "",
    icons: {
        icon: [
            {
                url: "/favicon.ico",
                href: "/favicon.ico"
            }
        ]
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={cn(
                "w-full h-full",
                inter.className
            )}>
                {children}
                <Toaster position='bottom-center' expand closeButton />
            </body>
        </html>
    )
}
