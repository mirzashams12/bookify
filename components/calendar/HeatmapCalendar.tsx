"use client";
import React, { useState, useMemo } from 'react';
import {
    format, startOfMonth, startOfWeek, addDays,
    isSameMonth, isSameDay, addMonths, subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BookingsGroupedByDate } from '@/types/bookings';

interface HeatmapCalendarProps {
    bookingsData: BookingsGroupedByDate;
}

const HeatmapCalendar = ({ bookingsData }: HeatmapCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    // Calculate the 42 days (6 weeks) to show in the calendar grid
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const startDate = startOfWeek(monthStart);
        // Using 42 ensures the calendar height stays consistent across all months
        return Array.from({ length: 42 }).map((_, i) => addDays(startDate, i));
    }, [currentMonth]);

    // Logic to determine the color intensity based on booking volume
    const getDayStyles = (total: number, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return 'text-slate-300 bg-transparent border-transparent opacity-20 pointer-events-none';
        if (total === 0) return 'text-slate-400 bg-white border-slate-100 hover:border-indigo-100';

        if (total <= 2) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        if (total <= 5) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        if (total <= 10) return 'bg-indigo-200 text-indigo-800 border-indigo-300';
        if (total <= 15) return 'bg-indigo-600 text-white border-indigo-500 shadow-sm';
        return 'bg-violet-700 text-white border-violet-600 shadow-lg ring-1 ring-white/20';
    };

    // Extracting data for the popup modal
    const activeDayData = selectedDay ? bookingsData[selectedDay] : null;

    return (
        <div className="flex flex-col items-center justify-center bg-slate-50 min-h-screen p-4 font-sans">

            <div className="w-full max-w-4xl bg-white rounded-[40px] p-6 md:p-10 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative">

                {/* --- Header Section --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 text-center md:text-left">
                    <div className="flex items-center gap-5 justify-center md:justify-start">
                        <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-200">
                            <CalendarIcon size={28} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{format(currentMonth, 'MMMM')}</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">{format(currentMonth, 'yyyy')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 mx-auto md:mx-0">
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

                {/* --- Weekday Names --- */}
                <div className="grid grid-cols-7 mb-6">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{day}</div>
                    ))}
                </div>

                {/* --- Calendar Grid --- */}
                <div className="grid grid-cols-7 gap-3 md:gap-5">
                    {calendarDays.map((day, idx) => {
                        const isCurrMonth = isSameMonth(day, currentMonth);
                        const isToday = isSameDay(day, new Date());
                        const dateKey = format(day, 'yyyy-MM-dd');

                        // Dynamic Data Lookup
                        const dayServices = bookingsData[dateKey] || {};
                        const serviceKeys = Object.keys(dayServices);
                        const totalBookings = Object.values(dayServices).reduce((a, b) => a + b, 0);

                        return (
                            <div
                                key={idx}
                                onClick={() => isCurrMonth && setSelectedDay(dateKey)}
                                className={`
                                    aspect-[4/5] md:aspect-square flex flex-col p-3 md:p-4 rounded-[24px] md:rounded-[32px] border transition-all duration-500 cursor-pointer group relative
                                    ${getDayStyles(totalBookings, isCurrMonth)}
                                    ${isToday ? 'ring-4 ring-indigo-400/30 border-indigo-500 shadow-xl scale-[1.05] z-10' : 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-100'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-auto">
                                    <span className={`text-xs font-bold ${isToday ? 'opacity-100' : 'opacity-40'}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {isToday && (
                                        <span className="bg-indigo-500 text-[8px] text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter animate-pulse">
                                            Today
                                        </span>
                                    )}
                                </div>

                                {isCurrMonth && serviceKeys.length > 0 && (
                                    <div className="space-y-1 mt-auto">
                                        <div className="h-1 w-6 bg-current opacity-30 rounded-full mb-1.5" />
                                        <p className="text-[10px] md:text-xs font-black leading-tight truncate">
                                            {serviceKeys[0]}
                                        </p>
                                        <p className="text-[9px] font-bold opacity-70 leading-tight">
                                            {serviceKeys.length > 1 ? `+${serviceKeys.length - 1} more` : '1 service'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* --- Detailed Modal --- */}
                {selectedDay && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-white/40 backdrop-blur-xl rounded-[40px] animate-in fade-in zoom-in duration-300">
                        <div className="w-full max-w-sm bg-white rounded-[35px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] p-8 border border-slate-100 relative">
                            <button
                                onClick={() => setSelectedDay(null)}
                                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-8">
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Details for</p>
                                <h4 className="text-2xl font-black text-slate-900">
                                    {format(new Date(selectedDay), 'EEEE, MMM do')}
                                </h4>
                            </div>

                            <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {activeDayData && Object.keys(activeDayData).length > 0 ? (
                                    Object.entries(activeDayData).map(([name, count]) => (
                                        <div key={name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all hover:translate-x-1">
                                            <span className="font-bold text-slate-700">{name}</span>
                                            <span className="bg-white px-3 py-1 rounded-xl shadow-sm text-sm font-black text-indigo-600 border border-slate-100">{count}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-sm font-medium py-4">No specific bookings recorded for this day.</p>
                                )}
                            </div>

                            <Link href={{
                                pathname: "/book",
                                query: { date: format(new Date(selectedDay), "yyyy/MM/dd") }
                            }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all group text-sm">
                                Book new appointment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Legend Section --- */}
            <div className="mt-12 flex items-center gap-8 bg-white px-8 py-4 rounded-full border border-slate-200 shadow-sm overflow-x-auto max-w-full">
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="w-3 h-3 rounded-full bg-indigo-50 border border-indigo-100" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Low</span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="w-3 h-3 rounded-full bg-indigo-600" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">High</span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="bg-indigo-500 w-2 h-2 rounded-full animate-pulse ring-4 ring-indigo-400/30" />
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Current Date</span>
                </div>
            </div>
        </div>
    );
};

export default HeatmapCalendar;