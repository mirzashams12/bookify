"use client";

import React, { useState, useMemo } from "react";
import {
    format,
    startOfMonth,
    startOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
} from "date-fns";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
} from "lucide-react";
import { BookingsGroupedByDate } from "@/types/bookings";
import DayDetailsModal from "./DayDetailsModal";

interface HeatmapCalendarProps {
    bookingsData: BookingsGroupedByDate;
}

const HeatmapCalendar = ({ bookingsData }: HeatmapCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    // Generate 42 days (6 rows fixed layout)
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const startDate = startOfWeek(monthStart);
        return Array.from({ length: 42 }).map((_, i) =>
            addDays(startDate, i)
        );
    }, [currentMonth]);

    // Heat intensity styling
    const getDayStyles = (total: number, isCurrentMonth: boolean) => {
        if (!isCurrentMonth)
            return "text-slate-300 bg-transparent border-transparent opacity-20 pointer-events-none";

        if (total === 0)
            return "text-slate-400 bg-white border-slate-100 hover:border-indigo-100";

        if (total <= 2)
            return "bg-indigo-50 text-indigo-600 border-indigo-100";

        if (total <= 5)
            return "bg-indigo-100 text-indigo-700 border-indigo-200";

        if (total <= 10)
            return "bg-indigo-200 text-indigo-800 border-indigo-300";

        if (total <= 15)
            return "bg-indigo-600 text-white border-indigo-500 shadow-sm";

        return "bg-violet-700 text-white border-violet-600 shadow-lg ring-1 ring-white/20";
    };

    const activeDayData = selectedDay
        ? bookingsData[selectedDay] || null
        : null;

    return (
        <div className="flex flex-col items-center justify-center bg-slate-50 min-h-screen p-4 font-sans">

            <div className="w-full max-w-4xl bg-white rounded-[40px] p-6 md:p-10 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 text-center md:text-left">
                    <div className="flex items-center gap-5 justify-center md:justify-start">
                        <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-200">
                            <CalendarIcon size={28} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                {format(currentMonth, "MMMM")}
                            </h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">
                                {format(currentMonth, "yyyy")}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 mx-auto md:mx-0">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-3 hover:bg-white hover:shadow-md rounded-xl text-slate-600 transition-all active:scale-90"
                        >
                            <ChevronLeft size={22} />
                        </button>

                        <button
                            onClick={() => setCurrentMonth(new Date())}
                            className="px-4 text-xs font-black text-slate-500 uppercase hover:text-indigo-600"
                        >
                            Today
                        </button>

                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-3 hover:bg-white hover:shadow-md rounded-xl text-slate-600 transition-all active:scale-90"
                        >
                            <ChevronRight size={22} />
                        </button>
                    </div>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 mb-6">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                            <div
                                key={day}
                                className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]"
                            >
                                {day}
                            </div>
                        )
                    )}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-3 md:gap-5">
                    {calendarDays.map((day, idx) => {
                        const isCurrMonth = isSameMonth(day, currentMonth);
                        const isToday = isSameDay(day, new Date());
                        const dateKey = format(day, "yyyy-MM-dd");

                        // ✅ Updated for new structure
                        const dayServices = bookingsData[dateKey] || [];
                        const totalBookings = dayServices.reduce(
                            (sum, service) => sum + service.count,
                            0
                        );

                        return (
                            <div
                                key={idx}
                                onClick={() =>
                                    isCurrMonth && setSelectedDay(dateKey)
                                }
                                className={`
                  aspect-[4/5] md:aspect-square flex flex-col p-3 md:p-4 rounded-[24px] md:rounded-[32px] border transition-all duration-500 cursor-pointer group relative
                  ${getDayStyles(totalBookings, isCurrMonth)}
                  ${isToday
                                        ? "ring-4 ring-indigo-400/30 border-indigo-500 shadow-xl scale-[1.05] z-10"
                                        : "hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-100"
                                    }
                `}
                            >
                                <div className="flex justify-between items-start mb-auto">
                                    <span
                                        className={`text-xs font-bold ${isToday ? "opacity-100" : "opacity-40"
                                            }`}
                                    >
                                        {format(day, "d")}
                                    </span>

                                    {isToday && (
                                        <span className="bg-indigo-500 text-[8px] text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter animate-pulse">
                                            Today
                                        </span>
                                    )}
                                </div>

                                {/* Service Preview */}
                                {isCurrMonth && dayServices.length > 0 && (
                                    <div className="space-y-1 mt-auto">
                                        <div className="h-1 w-6 bg-current opacity-30 rounded-full mb-1.5" />
                                        <p className="text-[10px] md:text-xs font-black leading-tight truncate">
                                            {dayServices[0].name}
                                        </p>
                                        <p className="text-[9px] font-bold opacity-70 leading-tight">
                                            {dayServices.length > 1
                                                ? `+${dayServices.length - 1} more`
                                                : "1 service"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Modal */}
                {selectedDay && (
                    <DayDetailsModal
                        selectedDay={selectedDay}
                        data={activeDayData}
                        onClose={() => setSelectedDay(null)}
                    />
                )}
            </div>

            {/* Legend */}
            <div className="mt-12 flex items-center gap-8 bg-white px-8 py-4 rounded-full border border-slate-200 shadow-sm overflow-x-auto max-w-full">
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="w-3 h-3 rounded-full bg-indigo-50 border border-indigo-100" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Low
                    </span>
                </div>

                <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="w-3 h-3 rounded-full bg-indigo-600" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        High
                    </span>
                </div>

                <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="bg-indigo-500 w-2 h-2 rounded-full animate-pulse ring-4 ring-indigo-400/30" />
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                        Current Date
                    </span>
                </div>
            </div>
        </div>
    );
};

export default HeatmapCalendar;