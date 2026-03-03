"use client";

import React, { useState } from 'react';
import { Appointment } from "@/types/appointment";
import { Status } from "@/types/status";
import { Settings2 } from "lucide-react";
import { TimeBadge } from "@/components/badge/TimeBadge";
import { StatusBadge } from "@/components/badge/StatusBadge";
import PaginationControls from "@/components/filter/PaginationControl";
import EditAppointmentDrawer from "@/components/booking/EditAppointmentDrawer";
import { useRouter } from 'next/navigation';

const getServiceColor = (name: string = "default") => {
    const colors = ["bg-blue-50 text-blue-700 border-blue-100", "bg-purple-50 text-purple-700 border-purple-100", "bg-pink-50 text-pink-700 border-pink-100", "bg-cyan-50 text-cyan-700 border-cyan-100", "bg-teal-50 text-teal-700 border-teal-100", "bg-indigo-50 text-indigo-700 border-indigo-100", "bg-violet-50 text-violet-700 border-violet-100"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

export default function AppointmentListContainer({ selectedAppointment, initialAppointments, statuses, specialties, totalPages, currentPage }: any) {
    const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(selectedAppointment);
    const router = useRouter();

    const handleUpdate = async (formData: any) => {
        if (!selectedAppt) return;
        const res = await fetch(`/api/appointments/${selectedAppt.id}`, {
            method: 'PATCH',
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            router.refresh();
            setSelectedAppt(null);
        }
    };

    if (initialAppointments.length === 0) {
        return (
            <div className="bg-white rounded-[32px] border border-slate-200 p-20 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-5 text-left">Customer</th>
                                <th className="px-8 py-5 text-left">Service</th>
                                <th className="px-8 py-5 text-left">Date</th>
                                <th className="px-8 py-5 text-left">Time</th>
                                <th className="px-8 py-5 text-left">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {initialAppointments.map((appt: Appointment) => (
                                <tr key={appt.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-8 py-5 font-bold text-slate-900 uppercase text-sm">{appt.name}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getServiceColor(appt.service_definitions?.name)}`}>
                                            {appt.service_definitions?.specialties?.name || 'Standard'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-600 text-sm">{appt.date}</td>
                                    <td className="px-8 py-5"><TimeBadge time={appt.time} /></td>
                                    <td className="px-8 py-5"><StatusBadge status={appt.status} /></td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => setSelectedAppt(appt)}
                                            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm group"
                                        >
                                            <Settings2 size={16} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationControls currentPage={currentPage} totalPages={totalPages} />
            </div>

            {selectedAppt && (
                <EditAppointmentDrawer
                    appointment={selectedAppt}
                    statuses={statuses}
                    specialties={specialties} // Ensure this is passed!
                    isOpen={!!selectedAppt}
                    onClose={() => setSelectedAppt(null)}
                    onUpdate={handleUpdate}
                />
            )}
        </>
    );
}