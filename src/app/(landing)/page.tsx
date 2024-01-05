import { MessageSquareMore } from "lucide-react";

export default function Home() {
    return (
        <div className="flex-1 w-full flex flex-col items-center justify-center text-indigo-600">
            <div className="flex flex-col items-center justify-center gap-y-1 select-none">
                <MessageSquareMore className="w-16 h-16" />
                <p className="text-2xl font-semibold">
                    Get your message there
                </p>
            </div>
        </div>
    )
}
