"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, FileText, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { Service } from "@/types/service";
import TimePicker from '../time/TimePicker';

interface BookAppointmentDrawerProps {
    services: Service[];
    onClose: () => void;
    date?: string;
}

export default function BookAppointmentDrawer({ services, onClose, date }: BookAppointmentDrawerProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const payload = {
            name: formData.get("name"),
            email: formData.get("email"),
            service: formData.get("service"),
            date: formData.get("date"),
            time: formData.get("time"),
            status: 1, // Defaulting to first status
        };

        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.refresh(); // Refresh the server data
                onClose(); // Close the drawer on success
            } else {
                alert("Failed to book appointment");
            }
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            {/* The Panel */}
            <div className="w-full max-w-xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">

                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Appointment</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Schedule a new session for a client</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-all active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 no-scrollbar flex flex-col">
                    <div className="space-y-10 flex-1">

                        {/* Client Info Section */}
                        <section className="space-y-4">
                            <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <User size={14} /> Client Information
                            </h2>
                            <div className="space-y-3">
                                <input
                                    required
                                    name="name"
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold transition-all"
                                />
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold transition-all"
                                />
                            </div>
                        </section>

                        <hr className="border-slate-50" />

                        {/* Service Details Section */}
                        <section className="space-y-4">
                            <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileText size={14} /> Service Selection
                            </h2>
                            <select
                                name="service"
                                required
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold transition-all appearance-none"
                            >
                                <option value="" disabled selected>Select a service</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Date</label>
                                    <input
                                        required
                                        name="date"
                                        type="date"
                                        defaultValue={date}
                                        readOnly={Boolean(date)}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Time</label>
                                    <TimePicker
                                        name="time"
                                        minTime="08:00"
                                        maxTime="21:30"
                                        interval={5}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-10 flex items-center justify-end gap-3 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl flex items-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95 text-xs uppercase tracking-widest"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <CheckCircle2 size={18} />
                            )}
                            {loading ? 'Processing...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}