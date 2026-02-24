"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Calendar, CheckCircle, Briefcase } from 'lucide-react';

export default function FilterDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value); else params.delete(key);
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('?page=1');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all active:scale-95 ${isOpen ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
            >
                <Filter size={16} />
                Filters
                {searchParams.toString() && <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />}
            </button>

            {/* Floating Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 p-6 animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Filter By</h4>
                        <button onClick={clearFilters} className="text-[10px] font-black text-indigo-600 hover:underline">Clear All</button>
                    </div>

                    <div className="space-y-5">
                        {/* Date Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2"><Calendar size={12} /> Date</label>
                            <input
                                type="date"
                                onChange={(e) => updateFilter("date", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-indigo-300"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2"><CheckCircle size={12} /> Status</label>
                            <select
                                onChange={(e) => updateFilter("status", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}