"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const user = localStorage.getItem("user");

        if (!user) {
            setAuthorized(false);
            router.push("/login");
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    if (!authorized) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    return <>{children}</>;
}