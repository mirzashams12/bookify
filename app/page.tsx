"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );
}