"use client";

import React from "react";
import { X, Shield, User, MapPin } from "lucide-react";

export default function CreateClientModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Client</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Enter profile and insurance data</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-10">
                    {/* Basic Info */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <User size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Basic Details</span>
                        </div>
                        <input type="text" placeholder="Full Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold transition-all" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="email" placeholder="Email Address" className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold transition-all" />
                            <input type="tel" placeholder="Phone Number" className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold transition-all" />
                        </div>
                    </section>

                    {/* Insurance Details */}
                    <section className="space-y-4 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <Shield size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Insurance Information</span>
                        </div>
                        <div className="space-y-4">
                            <input type="text" placeholder="Insurance Provider (e.g. SunLife, Manulife)" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold transition-all" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Policy Number" className="px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold transition-all" />
                                <input type="text" placeholder="Member ID" className="px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold transition-all" />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
                    <button className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Save Client Profile</button>
                </div>
            </div>
        </div>
    );
}