"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, User, FileText, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Service } from "@/types/service";
import TimePicker from '../time/TimePicker';

export default function BookAppointmentForm({ services, date }: { services: Service[], date?: string }) {
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
            status: 1,
        };

        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push('/dashboard/appointments');
                router.refresh();
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
        <>
            <Link href="/dashboard/appointments" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 group">
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold">Back to Appointments</span>
            </Link>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Appointment</h1>
                    <p className="text-sm text-slate-500 font-medium">Schedule a new session for a client.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <User size={14} /> Client Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input required name="name" type="text" placeholder="Full Name" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                            <input required name="email" type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="space-y-4">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} /> Service Details
                        </h2>
                        <select name="service" required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white">
                            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input required name="date" type="date" defaultValue={date} readOnly={Boolean(date)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                            <TimePicker
                                name="time"
                                minTime="08:00"
                                maxTime="21:30"
                                interval={5}
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex items-center justify-end gap-3">
                        <Link href="/dashboard/appointments" className="px-6 py-3 text-sm font-bold text-slate-500">Cancel</Link>
                        <button type="submit" disabled={loading} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl flex items-center gap-2">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={18} />}
                            {loading ? 'Scheduling...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}