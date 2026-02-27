"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { X, Calendar, ListChecks, Plus, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ServiceCount } from "@/types/bookings";
import BookAppointmentDrawer from "@/components/booking/BookAppointmentDrawer";

interface DayDetailsModalProps {
    selectedDay: string;
    data: ServiceCount[] | null;
    onClose: () => void;
    specialties: any[];
}

export default function DayDetailsModal({
    selectedDay,
    data,
    onClose,
    specialties
}: DayDetailsModalProps) {
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const totalBookings = data
        ? data.reduce((sum, service) => sum + service.count, 0)
        : 0;

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-md h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">

                    {/* Header */}
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">
                                Daily Overview
                            </p>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                {format(new Date(selectedDay), "MMM do, yyyy")}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-all active:scale-90">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
                        {/* Stats Card */}
                        {data && data.length > 0 ? (
                            <div className="p-6 bg-indigo-600 rounded-[32px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                                <Calendar className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-700" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Total Capacity</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-4xl font-black">{totalBookings}</h3>
                                    <Link
                                        href={{
                                            pathname: "/dashboard/appointments",
                                            query: { startDate: selectedDay, endDate: selectedDay, page: 1 },
                                        }}
                                        className="text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white text-white hover:text-indigo-600 px-4 py-2 rounded-xl transition-all backdrop-blur-md"
                                    >
                                        View All
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 border-2 border-dashed border-slate-100 rounded-[32px] text-center">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No activity for this day</p>
                            </div>
                        )}

                        {/* Service Breakdown (Links Restored) */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                <ListChecks size={14} /> Service Breakdown
                            </h4>
                            <div className="space-y-3">
                                {data && data.length > 0 ? (
                                    data.map((service) => (
                                        <Link
                                            key={service.id}
                                            href={{
                                                pathname: "/dashboard/appointments",
                                                query: {
                                                    startDate: selectedDay,
                                                    endDate: selectedDay,
                                                    page: 1,
                                                    service: service.id,
                                                },
                                            }}
                                            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-300 hover:bg-white hover:shadow-md transition-all hover:translate-x-1"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg group-hover:bg-indigo-50 transition-colors">
                                                    <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-500" />
                                                </div>
                                                <span className="font-bold text-slate-700 uppercase text-[11px] tracking-tight">
                                                    {service.name}
                                                </span>
                                            </div>
                                            <span className="bg-white px-3 py-1 rounded-xl shadow-sm text-xs font-black text-indigo-600 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                                {service.count}
                                            </span>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="py-10 flex flex-col items-center justify-center opacity-30 italic text-slate-500 text-sm">
                                        Empty Schedule
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                        <button
                            onClick={() => setIsBookingOpen(true)}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl active:scale-95 group"
                        >
                            Quick Book
                            <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Nested Booking Drawer */}
            {isBookingOpen && (
                <BookAppointmentDrawer
                    specialties={specialties}
                    date={selectedDay}
                    onClose={() => setIsBookingOpen(false)}
                />
            )}
        </>
    );
}