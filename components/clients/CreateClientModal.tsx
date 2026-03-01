"use client";

import React, { useState } from "react";
import { X, Shield, User, CheckCircle2, Loader2, Power, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Client } from "@/types/client";

interface CreateClientModalProps {
    client?: Client;
    onClose: () => void;
}

export default function CreateClientModal({ client, onClose }: CreateClientModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isActive, setIsActive] = useState(client ? client.is_active : true);

    const isEditMode = !!client;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const payload = {
            id: client?.id, // Only used for PATCH
            fullname: formData.get("fullname"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            insurance_provider: formData.get("insuranceProvider"),
            policy_number: formData.get("policyNumber"),
            member_id: formData.get("memberId"),
            is_active: isActive,
        };

        try {
            const res = await fetch("/api/clients", {
                method: isEditMode ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setShowSuccess(true);
                router.refresh();
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                const err = await res.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col relative overflow-hidden">

                {/* Success Overlay */}
                {showSuccess && (
                    <div className="absolute inset-0 z-[110] bg-white flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 size={40} className="text-emerald-600 animate-bounce" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                            {isEditMode ? "Changes Saved" : "Client Created"}
                        </h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Database Updated Successfully</p>
                    </div>
                )}

                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                            {isEditMode ? "Edit Client Profile" : "New Client"}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {isEditMode ? `Updating ${client.fullname}` : "Enter profile and insurance data"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-all active:scale-95">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
                    <div className="p-8 space-y-10 flex-1">

                        {/* Status Toggle (Only visible in Edit Mode) */}
                        {isEditMode && (
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                        {isActive ? <Power size={18} /> : <PowerOff size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-slate-900 tracking-tight">Active Status</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                                            {isActive ? 'Client is currently active' : 'Client is deactivated'}
                                        </p>
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
                        )}

                        {/* Basic Info */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <User size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Basic Details</span>
                            </div>
                            <input
                                required
                                name="fullname"
                                type="text"
                                defaultValue={client?.fullname}
                                placeholder="Full Name"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold transition-all"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    defaultValue={client?.email}
                                    placeholder="Email Address"
                                    className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold transition-all"
                                />
                                <input
                                    required
                                    name="phone"
                                    type="tel"
                                    defaultValue={client?.phone}
                                    placeholder="Phone Number"
                                    className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold transition-all"
                                />
                            </div>
                        </section>

                        {/* Insurance Details */}
                        <section className="space-y-4 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <Shield size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Insurance Information</span>
                            </div>
                            <div className="space-y-4">
                                <input
                                    name="insuranceProvider"
                                    type="text"
                                    defaultValue={client?.insurance_provider}
                                    placeholder="Insurance Provider (e.g. SunLife)"
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold transition-all"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        name="policyNumber"
                                        type="text"
                                        defaultValue={client?.policy_number}
                                        placeholder="Policy Number"
                                        className="px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold transition-all"
                                    />
                                    <input
                                        name="memberId"
                                        type="text"
                                        defaultValue={client?.member_id}
                                        placeholder="Member ID"
                                        className="px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold transition-all"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-3 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                isEditMode ? "Update Client Profile" : "Save Client Profile"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}