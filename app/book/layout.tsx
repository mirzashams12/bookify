"use client";

import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BookingLayoutProps {
    children: React.ReactNode;
}

export default function BookingLayout({ children }: BookingLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 font-sans">

            {/* --- HEADER --- */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200">
                            <Calendar size={22} strokeWidth={2.5} />
                        </div>
                        <span className="font-black text-lg tracking-tight text-slate-900">
                            BOOKIFY
                        </span>
                    </div>

                    {/* Back Button */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* --- PAGE CONTENT --- */}
            <main className="flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-3xl bg-white rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-slate-100 p-10">

                    {/* Page Heading */}
                    <div className="mb-10 text-center">
                        <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">
                            Book Appointment
                        </p>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Schedule Your Visit
                        </h1>
                        <p className="text-sm text-slate-400 mt-3 max-w-md mx-auto">
                            Choose your service and preferred date to secure your spot.
                        </p>
                    </div>

                    {/* Form Content */}
                    {children}

                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="text-center py-8 text-xs text-slate-400">
                © {new Date().getFullYear()} Bookify. All rights reserved.
            </footer>

        </div>
    );
}