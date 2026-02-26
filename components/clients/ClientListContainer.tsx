"use client";

import React, { useState } from "react";
import { Search, UserPlus, ShieldCheck, Mail, Phone } from "lucide-react";
import CreateClientModal from "./CreateClientModal";

export default function ClientListContainer({ initialClients }: { initialClients: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredClients = initialClients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[24px] outline-none focus:border-indigo-500 shadow-sm font-bold text-slate-600 transition-all"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                >
                    <UserPlus size={18} />
                    Add Client
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                    <div key={client.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xl border border-slate-100 uppercase">
                                {client.name.charAt(0)}
                            </div>
                            {client.insuranceProvider && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                    <ShieldCheck size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Insured</span>
                                </div>
                            )}
                        </div>

                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">{client.name}</h3>

                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Mail size={14} />
                                <span className="text-xs font-bold truncate">{client.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Phone size={14} />
                                <span className="text-xs font-bold">{client.phone}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && <CreateClientModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}