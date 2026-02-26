"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, User, Stethoscope, CheckCircle2, Loader2, Check, Power, PowerOff } from "lucide-react";

export default function CreateProviderModal({ specialties, provider, onClose }: { specialties: any[], provider?: any, onClose: () => void }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isActive, setIsActive] = useState(provider ? provider.is_active : true);

    // Extract linked specialty IDs if editing
    const initialSpecialties = provider?.provider_specialties?.map((ps: any) => ps.specialty.id) || [];
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSpecialties);

    const toggleSpecialty = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const payload = {
            id: provider?.id, // Present if editing
            fullname: formData.get("fullname"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            license_number: formData.get("license_number"),
            is_active: isActive,
            specialtyIds: selectedIds,
        };

        const method = provider ? "PATCH" : "POST";

        try {
            const res = await fetch("/api/providers", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setShowSuccess(true);
                router.refresh();
                setTimeout(() => onClose(), 1500);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col relative overflow-hidden">

                {showSuccess && (
                    <div className="absolute inset-0 z-[110] bg-white flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 text-center">
                        <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                        <h3 className="text-xl font-black text-slate-900 uppercase">Provider Updated</h3>
                        <p className="text-xs font-bold text-slate-400 mt-2">Changes saved successfully</p>
                    </div>
                )}

                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{provider ? 'Edit Provider' : 'New Provider'}</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Practitioner Details</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10">

                    {/* Active Status Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                {isActive ? <Power size={18} /> : <PowerOff size={18} />}
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase text-slate-900 tracking-tight">Provider Status</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Currently {isActive ? 'Accepting Appointments' : 'Inactive'}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            className={`w-12 h-6 rounded-full relative transition-all ${isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <User size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">General Profile</span>
                        </div>
                        <input defaultValue={provider?.fullname} required name="fullname" type="text" placeholder="Full Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" />
                        <div className="grid grid-cols-2 gap-4">
                            <input defaultValue={provider?.email} required name="email" type="email" placeholder="Email" className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" />
                            <input defaultValue={provider?.phone} required name="phone" type="tel" placeholder="Phone" className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" />
                        </div>
                        <input defaultValue={provider?.license_number} required name="license_number" type="text" placeholder="License #" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" />
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-900">
                            <Stethoscope size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Specialization Skills</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {specialties.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => toggleSpecialty(s.id)}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-tight ${selectedIds.includes(s.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200'}`}
                                >
                                    {s.name}
                                    {selectedIds.includes(s.id) && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="flex gap-3 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-4 font-black uppercase text-xs text-slate-400">Cancel</button>
                        <button disabled={loading} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-600 transition-all">
                            {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : (provider ? 'Save Changes' : 'Confirm Registration')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}