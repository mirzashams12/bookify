"use client";
import React, { useState, useEffect } from 'react'; // Added useEffect
import {
    LayoutDashboard, Users, Calendar, Settings,
    Bell, Search, Menu, LogOut, Briefcase, ChevronRight,
    User // Added User icon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [userData, setUserData] = useState<{ full_name: string; role: string } | null>(null); // State for user data
    const pathname = usePathname();

    // Fetch user data from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUserData(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user data", error);
            }
        }
    }, []);

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', url: "/dashboard" },
        { icon: Calendar, label: 'Appointments', url: "/dashboard/appointments" },
        { icon: Users, label: 'Clients', url: "/dashboard/clients" },
        { icon: Users, label: 'Providers', url: "/dashboard/providers" },
        { icon: Settings, label: 'Settings', url: "/dashboard/settings" },
    ];

    const activeItem = navItems
        .filter(item => pathname.startsWith(item.url))
        .reduce((prev, curr) => (curr.url.length > prev.url.length ? curr : prev), navItems[0]);

    return (
        <AuthGuard>
            <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">

                {/* --- SIDEBAR --- */}
                <aside
                    className={`${isSidebarOpen ? 'w-72' : 'w-24'
                        } bg-white border-r border-slate-200 transition-all duration-500 ease-in-out flex flex-col z-30`}
                >
                    <div className="h-20 flex items-center px-6 mb-4">
                        <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200 shrink-0">
                            <Briefcase size={24} strokeWidth={2.5} />
                        </div>
                        {isSidebarOpen && (
                            <span className="ml-4 font-black text-xl tracking-tighter text-slate-900 animate-in fade-in duration-500">
                                BOOKIFY
                            </span>
                        )}
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = item.url === activeItem.url;
                            return (
                                <Link href={item.url}
                                    key={item.label}
                                    className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all group ${isActive
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
                                        }`}
                                >
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                    {isSidebarOpen && (
                                        <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-100 space-y-2">
                        <button
                            onClick={() => {
                                localStorage.removeItem("user");
                                window.location.href = "/login";
                            }}
                            className="w-full flex items-center gap-4 p-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[20px] transition-all group"
                        >
                            <LogOut size={22} />
                            {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
                        </button>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col min-w-0 relative">
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-20">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setSidebarOpen(!isSidebarOpen)}
                                className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                            >
                                <Menu size={22} />
                            </button>
                            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400">
                                <span>Pages</span>
                                <ChevronRight size={14} />
                                <span className="text-slate-900 font-bold">{activeItem.label}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="relative hidden lg:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Quick Search..."
                                    className="w-64 pl-10 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>

                            <button className="relative p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                                <Bell size={22} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
                            </button>

                            {/* Updated Profile Section */}
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tighter leading-none">
                                        {userData?.full_name || 'Loading...'}
                                    </p>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">
                                        {userData?.role || 'Staff'}
                                    </p>
                                </div>
                                <div className="h-11 w-11 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400 shrink-0">
                                    <User size={24} strokeWidth={2} />
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 custom-scrollbar scroll-smooth">
                        <div className="max-w-[1400px] mx-auto">
                            {children}
                        </div>
                    </main>

                </div>
            </div>
        </AuthGuard>
    );
};

export default DashboardLayout;