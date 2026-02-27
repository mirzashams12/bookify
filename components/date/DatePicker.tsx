"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
    name: string;
    defaultValue?: string;
    onChange?: (date: string) => void;
}

export default function DatePicker({ name, defaultValue, onChange }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(defaultValue || "");
    const [viewDate, setViewDate] = useState(new Date(defaultValue || Date.now()));
    const [openUpward, setOpenUpward] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);

            // Smart Positioning check
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect && window.innerHeight - rect.bottom < 400) {
                setOpenUpward(true);
            } else {
                setOpenUpward(false);
            }
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    const year = viewDate.getFullYear();

    const selectDate = (day: number) => {
        const dateObj = new Date(year, viewDate.getMonth(), day);
        const dateString = dateObj.toISOString().split('T')[0];
        setSelectedDate(dateString);
        setIsOpen(false);
        if (onChange) onChange(dateString);
    };

    return (
        <div className="relative" ref={containerRef}>
            <input type="hidden" name={name} value={selectedDate} />
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold transition-all outline-none 
                ${isOpen ? 'border-indigo-500 bg-white ring-4 ring-indigo-50' : 'hover:bg-white hover:border-indigo-500'}`}
            >
                <span className={selectedDate ? "text-slate-900" : "text-slate-400 text-sm font-bold"}>
                    {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { dateStyle: 'medium' }) : "Select Date"}
                </span>
                <CalendarIcon size={18} className={isOpen ? "text-indigo-500" : "text-slate-300"} />
            </button>

            {isOpen && (
                <div className={`absolute left-0 right-0 w-[320px] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[28px] p-6 z-[120] animate-in fade-in zoom-in-95 duration-200 ${openUpward ? 'bottom-full mb-3' : 'top-full mt-3'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <button type="button" onClick={() => setViewDate(new Date(year, viewDate.getMonth() - 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><ChevronLeft size={20} /></button>
                        <span className="text-xs font-black uppercase text-slate-900 tracking-widest">{monthName} {year}</span>
                        <button type="button" onClick={() => setViewDate(new Date(year, viewDate.getMonth() + 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><ChevronRight size={20} /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="text-[10px] font-black text-slate-300 text-center uppercase mb-2">{d}</span>)}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={i} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => (
                            <button key={i} type="button" onClick={() => selectDate(i + 1)} className={`aspect-square rounded-xl text-xs font-bold transition-all ${selectedDate === new Date(year, viewDate.getMonth(), i + 1).toISOString().split('T')[0] ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}