"use client";

import { format } from "date-fns";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ServiceCount } from "@/types/bookings";

interface DayDetailsModalProps {
    selectedDay: string;
    data: ServiceCount[] | null;
    onClose: () => void;
}

export default function DayDetailsModal({
    selectedDay,
    data,
    onClose,
}: DayDetailsModalProps) {
    const totalBookings = data
        ? data.reduce((sum, service) => sum + service.count, 0)
        : 0;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-white/40 backdrop-blur-xl rounded-[40px] animate-in fade-in zoom-in duration-300">
            <div className="w-full max-w-sm bg-white rounded-[35px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] p-8 border border-slate-100 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                        Details for
                    </p>
                    <h4 className="text-2xl font-black text-slate-900">
                        {format(new Date(selectedDay), "EEEE, MMM do")}
                    </h4>
                </div>

                {/* Total Section */}
                {data && data.length > 0 && (<div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                        Total Bookings
                    </p>

                    <div className="flex items-center justify-between">
                        <span className="text-3xl font-black text-slate-900">
                            {totalBookings}
                        </span>

                        <Link
                            href={{
                                pathname: "/dashboard/appointments",
                                query: {
                                    startDate: selectedDay,
                                    endDate: selectedDay,
                                    page: 1,
                                },
                            }}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                            View All
                        </Link>
                    </div>
                </div>)
                }

                {/* Service Breakdown */}
                <div className="space-y-3 mb-8 max-h-[280px] overflow-y-auto pr-2">
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
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all hover:translate-x-1"
                            >
                                <span className="font-bold text-slate-700">
                                    {service.name}
                                </span>

                                <span className="bg-white px-3 py-1 rounded-xl shadow-sm text-sm font-black text-indigo-600 border border-slate-100">
                                    {service.count}
                                </span>
                            </Link>
                        ))
                    ) : (
                        <p className="text-slate-400 text-sm font-medium py-4">
                            No bookings recorded for this day.
                        </p>
                    )}
                </div>

                {/* CTA Button */}
                <Link
                    href={{
                        pathname: "/book",
                        query: {
                            date: format(new Date(selectedDay), "yyyy-MM-dd"),
                        },
                    }}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all group text-sm"
                >
                    Book new appointment
                    <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                    />
                </Link>

            </div>
        </div>
    );
}