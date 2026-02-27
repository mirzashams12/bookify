"use client";

import React, { useState } from "react";
import { Search, UserPlus, Mail, ShieldCheck, Edit3, Power, PowerOff } from "lucide-react";
import CreateProviderModal from "./CreateProviderModal";

export default function ProviderListContainer({ initialProviders, specialties }: { initialProviders: any[], specialties: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<any>(null);
    const [search, setSearch] = useState("");

    const handleEdit = (provider: any) => {
        setEditingProvider(provider);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingProvider(null);
        setIsModalOpen(true);
    };

    const filtered = initialProviders.filter(p =>
        p.fullname.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                        type="text"
                        placeholder="Search practitioners..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[24px] outline-none focus:border-indigo-500 shadow-sm font-bold text-slate-600 transition-all"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                >
                    <UserPlus size={18} /> Add Provider
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((provider) => (
                    <div key={provider.id} className={`bg-white p-6 rounded-[32px] border transition-all group relative overflow-hidden ${!provider.is_active ? 'opacity-60 grayscale-[0.5] border-slate-100' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black border border-slate-100 uppercase">
                                {provider.fullname.charAt(0)}
                            </div>
                            <button
                                onClick={() => handleEdit(provider)}
                                className="p-2 hover:bg-indigo-50 rounded-lg text-slate-300 hover:text-indigo-600 transition-all"
                            >
                                <Edit3 size={16} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{provider.fullname}</h3>
                            {!provider.is_active && (
                                <span className="bg-slate-100 text-slate-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Inactive</span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {provider.provider_specialties?.map((ps: any) => (
                                <span key={ps.specialty.id} className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                                    {ps.specialty.name}
                                </span>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 space-y-2">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Mail size={12} />
                                <span className="text-[10px] font-bold truncate">{provider.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <ShieldCheck size={12} />
                                <span className="text-[10px] font-bold">Lic: {provider.license_number}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <CreateProviderModal
                    specialties={specialties}
                    provider={editingProvider} // Pass provider to edit
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}