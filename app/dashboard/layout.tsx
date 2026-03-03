"use client";

import React, { useState, useEffect } from "react";
import {
    LayoutDashboard, Users, Calendar, Settings,
    Menu, LogOut, Briefcase, ChevronRight, User
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { ToastProvider } from "@/components/toast/ToastContext";
import SmartAISearch from "@/components/aiSearch/SmartAISearch";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [userData, setUserData] = useState<{ full_name: string; role: string } | null>(null);

    const pathname = usePathname();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try { setUserData(JSON.parse(storedUser)); } catch (e) { console.error(e); }
        }
    }, []);

    const navItems = [
        { icon: LayoutDashboard, label: "Overview", url: "/dashboard" },
        { icon: Calendar, label: "Appointments", url: "/dashboard/appointments" },
        { icon: Users, label: "Clients", url: "/dashboard/clients" },
        { icon: Users, label: "Providers", url: "/dashboard/providers" },
        { icon: Settings, label: "Settings", url: "/dashboard/settings" },
    ];

    const activeItem = navItems
        .filter((item) => pathname.startsWith(item.url))
        .reduce((prev, curr) => (curr.url.length > prev.url.length ? curr : prev), navItems[0]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <AuthGuard>
            <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans italic-none">

                {/* --- SIDEBAR --- */}
                <aside className={`${isSidebarOpen ? "w-72" : "w-24"} bg-white border-r border-slate-200 transition-all duration-500 flex flex-col z-30 shadow-sm`}>
                    <div className="h-20 flex items-center px-6 mb-4">
                        <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shrink-0">
                            <Briefcase size={24} strokeWidth={2.5} />
                        </div>
                        {isSidebarOpen && <span className="ml-4 font-black text-xl tracking-tighter text-slate-900 uppercase">BOOKIFY AI</span>}
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url));
                            return (
                                <Link href={item.url} key={item.label} className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all group ${isActive ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "text-slate-400 hover:bg-slate-50 hover:text-indigo-600"}`}>
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                    {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-100">
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[20px] transition-all">
                            <LogOut size={22} />
                            {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
                        </button>
                    </div>
                </aside>

                {/* --- MAIN CONTENT --- */}
                <div className="flex-1 flex flex-col min-w-0 relative">

                    {/* --- HEADER --- */}
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-20">
                        <div className="flex items-center gap-6">
                            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                                <Menu size={22} />
                            </button>
                            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400">
                                <span>Pages</span> <ChevronRight size={14} /> <span className="text-slate-900 font-bold tracking-tight">{activeItem.label}</span>
                            </div>
                        </div>

                        {/* Smart AI Search Component */}
                        <SmartAISearch />

                        {/* Profile Section */}
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-900 uppercase leading-none">{userData?.full_name || "Admin User"}</p>
                                <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">{userData?.role || "Staff"}</p>
                            </div>
                            <div className="h-11 w-11 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400">
                                <User size={24} />
                            </div>
                        </div>
                    </header>

                    {/* --- MAIN APP AREA --- */}
                    <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-50/30">
                        <div className="max-w-[1400px] mx-auto">
                            <ToastProvider>
                                {children}
                            </ToastProvider>
                        </div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}