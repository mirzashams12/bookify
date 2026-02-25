"use client";
import React, { useState, useRef, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Calendar, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { Status } from "@/types/status";
import { Service } from "@/types/service";

interface FilterDropdownProps {
    statuses: Status[];
    services: Service[];
}

export default function FilterDropdown({ statuses, services }: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const router = useRouter();
    const searchParams = useSearchParams();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Draft state (local only)
    const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
    const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
    const [status, setStatus] = useState(searchParams.get("status") || "");
    const [service, setService] = useState(searchParams.get("service") || "");

    // Apply filters to URL
    const applyFilters = () => {
        const params = new URLSearchParams();

        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        if (status) params.set("status", status);
        if (service) params.set("service", service);

        params.set("page", "1");

        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    };

    // Close + apply when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                if (isOpen) {
                    applyFilters();
                    setIsOpen(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, startDate, endDate, status, service]);

    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
        setStatus("");
        setService("");

        startTransition(() => {
            router.push("?page=1");
        });

        setIsOpen(false);
    };

    const hasActiveFilters =
        searchParams.get("startDate") ||
        searchParams.get("endDate") ||
        searchParams.get("status") ||
        searchParams.get("service");

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all active:scale-95 ${isOpen
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
            >
                {isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Filter size={16} />
                )}
                Filters
                {hasActiveFilters && (
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">
                            Filter By
                        </h4>
                        <button
                            onClick={clearFilters}
                            className="text-[10px] font-black text-indigo-600 hover:underline"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="space-y-5">
                        {/* Start Date */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Calendar size={12} /> Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-indigo-300"
                            />
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Calendar size={12} /> End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-indigo-300"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                                <CheckCircle size={12} /> Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                {statuses.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Service */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Sparkles size={12} /> Services
                            </label>
                            <select
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer"
                            >
                                <option value="">All Services</option>
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}