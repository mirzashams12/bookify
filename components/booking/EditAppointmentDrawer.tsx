"use client";

import React, { useState } from 'react';
import { X, Calendar, Clock, User, Mail, Tag, CheckCircle, Save, Loader2 } from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { StatusBadge } from '@/components/badge/StatusBadge';
import { TimeBadge } from '@/components/badge/TimeBadge';

interface EditAppointmentDrawerProps {
    appointment: Appointment;
    isOpen: boolean;
    onClose: () => void;
    statuses: any[];
    onUpdate: (updatedData: any) => Promise<void>;
}

export default function EditAppointmentDrawer({
    appointment,
    isOpen,
    onClose,
    statuses,
    onUpdate
}: EditAppointmentDrawerProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        status_id: appointment.status.id,
        final_price: appointment.final_price || appointment.service_definitions?.base_price || 0,
        final_duration: appointment.final_duration || appointment.service_definitions?.base_duration || 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(formData);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Appointment Details</p>
                            <h2 className="text-xl font-black text-slate-900 uppercase italic">Ref: #{appointment.id.slice(0, 8)}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                        {/* Info Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                                    <p className="text-sm font-bold text-slate-900 uppercase">{appointment.name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Calendar size={16} className="text-indigo-500 mb-2" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                    <p className="text-xs font-bold text-slate-700 mt-1">{appointment.date}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Clock size={16} className="text-indigo-500 mb-2" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                                    <p className="text-xs font-bold text-slate-700 mt-1">{appointment.time}</p>
                                </div>
                            </div>
                        </div>

                        {/* Editable Fields */}
                        <div className="space-y-6 pt-6 border-t border-slate-100">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Update Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {statuses.map((s) => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status_id: s.id })}
                                            className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${formData.status_id === s.id
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                                                    : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'
                                                }`}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-center">Final Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.final_price}
                                        onChange={(e) => setFormData({ ...formData, final_price: Number(e.target.value) })}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-center">Duration (Min)</label>
                                    <input
                                        type="number"
                                        value={formData.final_duration}
                                        onChange={(e) => setFormData({ ...formData, final_duration: Number(e.target.value) })}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Footer Actions */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-white text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}