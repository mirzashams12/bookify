"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    LayoutDashboard, Users, Calendar, Settings, Bell, Search,
    Menu, LogOut, Briefcase, ChevronRight, User, Loader2,
    TrendingUp, ArrowUpRight, XCircle
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [userData, setUserData] = useState<{ full_name: string; role: string } | null>(null);
    const [aiQuery, setAiQuery] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);

    const pathname = usePathname();
    const router = useRouter();
    const resultRef = useRef<HTMLDivElement>(null);

    // Fetch user data
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try { setUserData(JSON.parse(storedUser)); } catch (e) { console.error(e); }
        }
    }, []);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resultRef.current && !resultRef.current.contains(event.target as Node)) {
                setAiResult(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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

    const handleAISearch = async () => {
        if (!aiQuery.trim()) return;
        setAiLoading(true);
        setAiResult(null);

        try {
            const intentRes = await fetch("/api/ai/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: aiQuery }),
            });
            const intent = await intentRes.json();
            if (intent.error) throw new Error(intent.error);

            const executeRes = await fetch("/api/ai/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(intent),
            });
            const result = await executeRes.json();
            setAiResult(result);
        } catch (error) {
            setAiResult({ error: "Could not process AI request." });
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <AuthGuard>
            <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans italic-none">
                {/* --- SIDEBAR --- */}
                <aside className={`${isSidebarOpen ? "w-72" : "w-24"} bg-white border-r border-slate-200 transition-all duration-500 flex flex-col z-30`}>
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
                        <button onClick={() => { localStorage.removeItem("user"); window.location.href = "/login"; }} className="w-full flex items-center gap-4 p-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[20px]">
                            <LogOut size={22} />
                            {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
                        </button>
                    </div>
                </aside>

                {/* --- MAIN CONTENT --- */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-20">
                        <div className="flex items-center gap-6">
                            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500">
                                <Menu size={22} />
                            </button>
                            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400">
                                <span>Pages</span> <ChevronRight size={14} /> <span className="text-slate-900 font-bold">{activeItem.label}</span>
                            </div>
                        </div>

                        {/* --- 🧠 AI SEARCH CONTAINER --- */}
                        <div className="relative hidden lg:block" ref={resultRef}>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:scale-110 transition-transform" size={16} />
                                <input
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
                                    placeholder="Ask AI anything... (e.g. Total revenue today)"
                                    className="w-96 pl-10 pr-10 py-2.5 bg-slate-100/50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all"
                                />
                                {aiLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-indigo-600" size={16} />}
                            </div>

                            {/* --- AI RESULT PANEL --- */}
                            {aiResult && (
                                <div className="absolute top-full left-0 mt-4 w-[450px] bg-white border border-slate-100 rounded-[32px] shadow-[0_20px_70px_rgba(0,0,0,0.15)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                                                <TrendingUp size={14} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Bookify AI Analysis</span>
                                        </div>
                                        <button onClick={() => setAiResult(null)} className="text-slate-400 hover:text-slate-600"><XCircle size={18} /></button>
                                    </div>

                                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-2">
                                        {/* Revenue Card */}
                                        {aiResult.revenue !== undefined && (
                                            <div className="m-2 p-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                                                <div className="relative z-10">
                                                    <p className="text-[10px] font-bold uppercase opacity-70 tracking-widest">Total Revenue Found</p>
                                                    <p className="text-3xl font-black mt-1 tracking-tighter italic">₹{aiResult.revenue.toLocaleString()}</p>
                                                </div>
                                                <TrendingUp className="absolute right-[-10px] bottom-[-10px] text-white/10 w-24 h-24" />
                                            </div>
                                        )}

                                        {/* Results List */}
                                        {aiResult.results && (
                                            <div className="mt-2 space-y-1">
                                                <p className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Matching Records</p>
                                                {aiResult.results.length === 0 ? (
                                                    <div className="py-10 text-center">
                                                        <Calendar size={40} className="mx-auto text-slate-100 mb-3" />
                                                        <p className="text-xs font-bold text-slate-400 italic uppercase">No entries found for this query</p>
                                                    </div>
                                                ) : (
                                                    aiResult.results.map((item: any, idx: number) => (
                                                        <Link
                                                            key={idx}
                                                            href={`/dashboard/appointments?id=${item.id}`}
                                                            onClick={() => setAiResult(null)}
                                                            className="flex items-center gap-4 p-4 hover:bg-indigo-50/50 rounded-2xl transition-all group border border-transparent hover:border-indigo-100 mx-1"
                                                        >
                                                            <div className="h-12 w-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                                <Calendar size={20} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{item.name}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                                                    <span className="text-indigo-500 italic">{item.service_definitions?.specialties?.name || "General"}</span> • {item.date}
                                                                </p>
                                                            </div>
                                                            <ArrowUpRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-all opacity-0 group-hover:opacity-100" />
                                                        </Link>
                                                    ))
                                                )}
                                            </div>
                                        )}

                                        {/* Error State */}
                                        {aiResult.error && (
                                            <div className="m-3 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4">
                                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm"><XCircle size={20} /></div>
                                                <div>
                                                    <p className="text-[11px] font-black text-red-700 uppercase">Search Error</p>
                                                    <p className="text-[10px] font-bold text-red-500/80 uppercase mt-0.5">{aiResult.error}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-slate-50/80 text-center border-t border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Press Esc to dismiss • Bookify Intelligence v1.0</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Section */}
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-900 uppercase leading-none">{userData?.full_name || "Admin"}</p>
                                <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">{userData?.role || "Staff"}</p>
                            </div>
                            <div className="h-11 w-11 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400">
                                <User size={24} />
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                        <div className="max-w-[1400px] mx-auto">{children}</div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}