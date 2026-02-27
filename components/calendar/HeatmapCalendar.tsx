"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    format,
    startOfMonth,
    startOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    setMonth,
    setYear
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { BookingsGroupedByDate } from "@/types/bookings";
import DayDetailsModal from "./DayDetailsModal";
import { Service } from "@/types/service";

interface HeatmapCalendarProps {
    bookingsData: BookingsGroupedByDate;
    specialties: Service[];
}

const HeatmapCalendar = ({ bookingsData, specialties }: HeatmapCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<"month" | "year" | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const yearScrollRef = useRef<HTMLDivElement>(null);
    const activeYearRef = useRef<HTMLButtonElement>(null);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const years = useMemo(() => {
        const startYear = 1926;
        const endYear = 2126;
        return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    }, []);

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const startDate = startOfWeek(monthStart);
        return Array.from({ length: 35 }).map((_, i) => addDays(startDate, i));
    }, [currentMonth]);

    useEffect(() => {
        if (openDropdown === "year" && activeYearRef.current && yearScrollRef.current) {
            activeYearRef.current.scrollIntoView({
                block: "center",
                behavior: "instant"
            });
        }
    }, [openDropdown]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const getDayStyles = (total: number, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return "bg-slate-50 opacity-20 pointer-events-none";
        if (total === 0) return "bg-white text-slate-300 hover:bg-slate-50/50";
        if (total === 1) return "bg-[#96E072] text-[#1E4610] border-[#7BC559]";
        if (total === 2) return "bg-[#917CEE] text-white border-[#7A64D8]";
        if (total <= 5) return "bg-[#FF9F55] text-white border-[#E68A40]";
        return "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-100";
    };

    return (
        <div className="w-full font-sans">
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                {/* --- CUSTOM SELECTORS --- */}
                <div className="flex items-center gap-1 p-1.5 bg-white border border-slate-200 rounded-[24px] shadow-sm relative" ref={containerRef}>
                    <div className="pl-3 pr-2 text-indigo-500">
                        <CalendarIcon size={18} />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setOpenDropdown(openDropdown === "month" ? null : "month")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                {format(currentMonth, "MMMM")}
                            </span>
                            <ChevronDown size={14} className={`text-slate-300 transition-transform ${openDropdown === "month" ? "rotate-180" : ""}`} />
                        </button>

                        {openDropdown === "month" && (
                            <div className="absolute top-full left-0 mt-3 w-48 bg-white border border-slate-100 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                                <div className="max-h-60 overflow-y-auto no-scrollbar">
                                    {months.map((m, i) => (
                                        <button
                                            key={m}
                                            onClick={() => { setCurrentMonth(setMonth(currentMonth, i)); setOpenDropdown(null); }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${currentMonth.getMonth() === i ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-[1px] h-4 bg-slate-100 mx-1" />

                    <div className="relative">
                        <button
                            onClick={() => setOpenDropdown(openDropdown === "year" ? null : "year")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            <span className="text-sm font-black text-slate-400 uppercase tracking-tight">
                                {format(currentMonth, "yyyy")}
                            </span>
                            <ChevronDown size={14} className={`text-slate-300 transition-transform ${openDropdown === "year" ? "rotate-180" : ""}`} />
                        </button>

                        {openDropdown === "year" && (
                            <div className="absolute top-full right-0 mt-3 w-32 bg-white border border-slate-100 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                                <div ref={yearScrollRef} className="max-h-48 overflow-y-auto no-scrollbar scroll-smooth">
                                    {years.map(y => {
                                        const isSelected = currentMonth.getFullYear() === y;
                                        return (
                                            <button
                                                key={y}
                                                ref={isSelected ? activeYearRef : null}
                                                onClick={() => { setCurrentMonth(setYear(currentMonth, y)); setOpenDropdown(null); }}
                                                className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                                            >
                                                {y}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- NAVIGATION --- */}
                <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-600 transition-all active:scale-90">
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setCurrentMonth(new Date())} className="px-4 text-[10px] font-black text-slate-500 uppercase hover:text-indigo-600 transition-colors">
                        Today
                    </button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-600 transition-all active:scale-90">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* --- CALENDAR GRID --- */}
            <div className="bg-slate-200 border border-slate-200 rounded-[32px] overflow-hidden shadow-sm grid grid-cols-7 gap-[1px]">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="bg-white py-4 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {day}
                    </div>
                ))}
                {calendarDays.map((day, idx) => {
                    const isCurrMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, new Date());
                    const dateKey = format(day, "yyyy-MM-dd");
                    const dayServices = bookingsData[dateKey] || [];
                    const totalBookingsCount = dayServices.reduce((sum, s) => sum + s.count, 0);
                    const uniqueServiceTypesCount = dayServices.length;

                    return (
                        <div
                            key={idx}
                            onClick={() => isCurrMonth && setSelectedDay(dateKey)}
                            className={`aspect-[4/3] p-3 flex flex-col justify-between transition-all cursor-pointer group relative overflow-hidden
                                ${getDayStyles(totalBookingsCount, isCurrMonth)} 
                                ${isToday && isCurrMonth ? "shadow-[inset_0_4px_12px_rgba(0,0,0,0.15)] bg-slate-100 !text-indigo-600" : ""}
                            `}
                        >
                            {/* --- NEUMORPHIC / DEPTH INDICATOR --- */}
                            {isToday && isCurrMonth && (
                                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-white rounded-full shadow-sm border border-slate-100">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Today</span>
                                </div>
                            )}

                            <div className="flex justify-between items-start">
                                <span className={`text-[11px] font-black ${isToday && isCurrMonth ? "text-indigo-600" : "opacity-80"}`}>
                                    {format(day, "d")}
                                </span>
                            </div>

                            {isCurrMonth && uniqueServiceTypesCount > 0 && (
                                <div className="mt-auto">
                                    <p className="text-[10px] font-black leading-tight truncate uppercase tracking-tighter">
                                        {dayServices[0].name}
                                    </p>
                                    {uniqueServiceTypesCount > 1 && (
                                        <p className="text-[8px] font-bold opacity-60 mt-0.5">
                                            + {uniqueServiceTypesCount - 1} more
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedDay && (
                <DayDetailsModal
                    selectedDay={selectedDay}
                    data={bookingsData[selectedDay] || null}
                    specialties={specialties} // Ensure this is available in your Heatmap component
                    onClose={() => setSelectedDay(null)}
                />
            )}
        </div>
    );
};

export default HeatmapCalendar;