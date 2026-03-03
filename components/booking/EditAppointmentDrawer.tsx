"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    X, Calendar, Clock, User, Save, Loader2, ClipboardList,
    Plus, Minus, AlertCircle, CheckCircle2, Stethoscope, Hash, Lock, Info
} from 'lucide-react';
import { Appointment } from '@/types/appointment';
import DatePicker from '../date/DatePicker';
import TimePicker from '../time/TimePicker';
import { useToast } from '@/components/toast/ToastContext';

interface EditAppointmentDrawerProps {
    appointment: Appointment;
    isOpen: boolean;
    onClose: () => void;
    statuses: any[];
    specialties: any[];
    onUpdate: (updatedData: any) => Promise<void>;
}

export default function EditAppointmentDrawer({
    appointment,
    isOpen,
    onClose,
    statuses,
    specialties,
    onUpdate
}: EditAppointmentDrawerProps) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<any>(null);
    const [changesSummary, setChangesSummary] = useState<string[]>([]);

    const formRef = useRef<HTMLFormElement>(null);
    const { showToast } = useToast();

    const currentStatusName = appointment.status?.name?.toLowerCase() || "";
    const isLocked = currentStatusName === 'completed' || currentStatusName === 'cancelled';

    // --- State Management ---
    const [selectedStatusId, setSelectedStatusId] = useState<string>(appointment.status.id);
    const currentSpecialtyId = (appointment as any).service_definitions?.specialties?.id;
    const currentSpecialtyName = (appointment as any).service_definitions?.specialties?.name || "General";

    const [selectedServiceId, setSelectedServiceId] = useState<string>(appointment.service_definitions?.id || "");
    const [currentDuration, setCurrentDuration] = useState<number>(appointment.final_duration || 0);
    const [currentPrice, setCurrentPrice] = useState<number>(appointment.final_price || 0);

    // Sync state whenever the drawer opens to ensure fresh appointment data is reflected
    useEffect(() => {
        if (isOpen) {
            setSelectedStatusId(appointment.status.id);
            setSelectedServiceId(appointment.service_definitions?.id || "");
            setCurrentDuration(appointment.final_duration || 0);
            setCurrentPrice(appointment.final_price || 0);
        }
    }, [appointment, isOpen]);

    const availableServices = specialties?.find(s => s.id === currentSpecialtyId)?.service_definitions || [];
    const activeServiceData = availableServices.find((s: any) => s.id === selectedServiceId);

    const handleServiceSelect = (def: any) => {
        if (isLocked) return;
        setSelectedServiceId(def.id);
        setCurrentDuration(Number(def.base_duration));
        setCurrentPrice(Number(def.base_price));
    };

    const adjustDuration = (amount: number) => {
        if (!activeServiceData || isLocked) return;
        const newDuration = Math.max(30, currentDuration + amount);
        const tier = activeServiceData.rates_chart?.find((r: any) => Number(r.duration_minutes) === newDuration);

        if (tier) {
            setCurrentDuration(newDuration);
            setCurrentPrice(Number(tier.price));
        } else if (newDuration === Number(activeServiceData.base_duration)) {
            setCurrentDuration(newDuration);
            setCurrentPrice(Number(activeServiceData.base_price));
        }
    };

    const handlePreSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isLocked || !formRef.current) return;

        const formData = new FormData(formRef.current);
        const payload = {
            status_id: selectedStatusId,
            service_id: selectedServiceId,
            final_duration: currentDuration,
            final_price: currentPrice,
            date: formData.get("date"),
            time: formData.get("time"),
        };

        const diffs: string[] = [];
        if (payload.status_id !== appointment.status.id) diffs.push("Status updated");
        if (payload.service_id !== appointment.service_definitions?.id) diffs.push("Service changed");
        if (payload.final_duration !== appointment.final_duration) diffs.push(`Duration: ${currentDuration}m`);
        if (payload.final_price !== appointment.final_price) diffs.push(`Price: ₹${currentPrice}`);
        if (payload.date !== appointment.date) diffs.push("Date rescheduled");
        if (payload.time !== appointment.time) diffs.push("Time adjusted");

        if (diffs.length > 0) {
            setChangesSummary(diffs);
            setPendingPayload(payload);
            setShowConfirm(true);
        } else {
            onClose();
        }
    };

    const confirmUpdate = async () => {
        setLoading(true);
        try {
            await onUpdate(pendingPayload);
            showToast("Appointment updated successfully", "success");
            onClose();
        } catch (error) {
            showToast("Failed to update appointment", "error");
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white z-[70] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col overflow-hidden">

                {/* --- 🛡️ CONFIRMATION UI --- */}
                {showConfirm && (
                    <div className="absolute inset-0 z-[80] bg-white/80 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-300">
                        <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] max-w-sm w-full space-y-6 animate-in zoom-in-95 duration-300 text-center">
                            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto rotate-12">
                                <AlertCircle className="text-indigo-600 -rotate-12" size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Apply Changes?</h3>
                            <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                                {changesSummary.map((change, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[11px] font-black text-slate-600 uppercase text-left">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        {change}
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col gap-3">
                                <button onClick={confirmUpdate} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                    Confirm & Update
                                </button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest border border-slate-100">Go Back</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 italic">
                            {isLocked ? "Archived Appointment" : "Appointment Editor"}
                        </p>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                            {isLocked && <Lock size={20} className="text-slate-400" />}
                            Session Details
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100"><X size={24} /></button>
                </div>

                <form ref={formRef} onSubmit={handlePreSubmit} className={`flex-1 overflow-y-auto p-8 no-scrollbar space-y-10 pb-32 transition-opacity ${isLocked ? 'opacity-80' : ''}`}>

                    {/* Patient & Provider Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient</p>
                            <p className="text-xs font-black text-slate-900 uppercase truncate">{appointment.name}</p>
                        </div>
                        <div className="p-5 bg-indigo-50/30 rounded-[24px] border border-indigo-100">
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Provider</p>
                            <p className="text-xs font-black text-indigo-900 uppercase truncate">{(appointment as any).providers?.fullname}</p>
                        </div>
                    </div>

                    {/* 1. Workflow Status */}
                    <section className="space-y-4">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Workflow Status
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {statuses.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() => setSelectedStatusId(s.id)}
                                    className={`p-4 rounded-xl border text-[10px] font-black uppercase transition-all ${selectedStatusId === s.id ? "bg-slate-900 text-white shadow-xl border-slate-900 scale-[1.02]" : "bg-white text-slate-400 border-slate-100 hover:border-indigo-200"}`}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* 2. Service Selection (PRE-HIGHLIGHTED) */}
                    <section className="space-y-4">
                        <h2 className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-2">
                            <ClipboardList size={14} /> Services: {currentSpecialtyName}
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {availableServices.map((def: any) => {
                                const isSelected = selectedServiceId === def.id;
                                const hasRates = def.rates_chart && def.rates_chart.length > 0;

                                return (
                                    <div
                                        key={def.id}
                                        onClick={() => !isLocked && handleServiceSelect(def)}
                                        className={`p-6 rounded-[32px] border transition-all relative overflow-hidden ${isSelected
                                            ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500/20 shadow-2xl scale-[1.02] z-10"
                                            : "border-slate-100 bg-slate-50/50 hover:bg-white"
                                            } ${isLocked ? 'cursor-default' : 'cursor-pointer hover:shadow-lg'}`}
                                    >
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    {isSelected ? (
                                                        <div className="px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-full tracking-widest">Selected Service</div>
                                                    ) : (
                                                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                                                    )}
                                                    <span className={`text-sm font-black uppercase tracking-tight ${isSelected ? "text-indigo-900" : "text-slate-500"}`}>
                                                        {def.name}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-colors ${isSelected ? "bg-white text-indigo-600 shadow-sm" : "bg-slate-100 text-slate-400"}`}>
                                                        <Clock size={12} />
                                                        {isSelected ? `${currentDuration} Min` : `${def.base_duration} Min`}
                                                    </div>
                                                    <div className={`text-xs font-black transition-colors ${isSelected ? "text-indigo-600" : "text-slate-400"}`}>
                                                        ₹{isSelected ? currentPrice : def.base_price}
                                                    </div>
                                                </div>
                                            </div>

                                            {isSelected && !isLocked && hasRates && (
                                                <div className="flex items-center bg-white border border-indigo-100 rounded-[20px] p-1.5 shadow-sm ml-4 scale-110">
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); adjustDuration(-30); }} className="p-2 text-indigo-600 rounded-xl hover:bg-indigo-50"><Minus size={18} /></button>
                                                    <div className="px-2 text-center min-w-[50px]">
                                                        <p className="text-[10px] font-black text-indigo-600 uppercase">Time</p>
                                                    </div>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); adjustDuration(30); }} className="p-2 text-indigo-600 rounded-xl hover:bg-indigo-50"><Plus size={18} /></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 3. Schedule Adjustment */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest px-1">Appointment Date</label>
                            <DatePicker name="date" defaultValue={appointment.date} disabled={isLocked} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest px-1">Session Time</label>
                            <TimePicker name="time" value={appointment.time} disabled={isLocked} />
                        </div>
                    </div>
                </form>

                {!isLocked && (
                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white to-transparent z-[75]">
                        <button type="button" onClick={() => handlePreSubmit()} className="w-full py-5 bg-slate-900 text-white font-black rounded-[24px] uppercase text-xs tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 pointer-events-auto">
                            Save All Changes
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}