"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, DollarSign, Clock, ChevronRight } from 'lucide-react';

export default function SpecialtyPricingManager() {
    const [specialties, setSpecialties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSpecialty, setActiveSpecialty] = useState<any | null>(null);

    useEffect(() => {
        fetchSpecialties();
    }, []);

    async function fetchSpecialties() {
        setLoading(true);
        const res = await fetch('/api/specialties');
        const data = await res.json();
        setSpecialties(data);
        setLoading(false);
    }

    return (
        <div className="grid grid-cols-12 gap-8 h-[calc(100vh-200px)]">
            {/* Left Column: Specialty List */}
            <div className="col-span-4 border-r border-slate-100 pr-6 space-y-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Specialties</h3>
                    <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                        <Plus size={16} />
                    </button>
                </div>

                <div className="space-y-2">
                    {specialties.map(spec => (
                        <button
                            key={spec.id}
                            onClick={() => setActiveSpecialty(spec)}
                            className={`w-full flex justify-between items-center p-4 rounded-2xl text-left transition-all ${activeSpecialty?.id === spec.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            <span className="font-bold text-sm uppercase">{spec.name}</span>
                            <ChevronRight size={16} className={activeSpecialty?.id === spec.id ? 'opacity-100' : 'opacity-20'} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Column: Service Definitions & Tiers */}
            <div className="col-span-8 overflow-y-auto no-scrollbar pb-20">
                {activeSpecialty ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase italic">{activeSpecialty.name}</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase mt-1">Manage services and tiered pricing</p>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:shadow-lg transition-all">
                                <Plus size={14} /> Add Service
                            </button>
                        </div>

                        <div className="space-y-6">
                            {activeSpecialty.service_definitions?.map((service: any) => (
                                <div key={service.id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 uppercase">{service.name}</h4>
                                            <div className="flex gap-4 mt-2">
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><Clock size={12} /> {service.base_duration}m Base</span>
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase"><DollarSign size={12} /> ${service.base_price} Base</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><Edit2 size={18} /></button>
                                            <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </div>

                                    {/* Nested Rates Chart */}
                                    <div className="bg-slate-50 rounded-[24px] p-6">
                                        <h5 className="text-[9px] font-black text-slate-400 uppercase mb-4 tracking-widest">Tiered Pricing (Non-Linear)</h5>
                                        <div className="grid grid-cols-3 gap-4">
                                            {service.rates_chart?.map((rate: any, idx: number) => (
                                                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col items-center">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">{rate.duration_minutes}m</span>
                                                    <span className="text-lg font-black text-indigo-600">${rate.price}</span>
                                                </div>
                                            ))}
                                            <button className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center py-4 text-slate-300 hover:border-indigo-300 hover:text-indigo-400 transition-all">
                                                <Plus size={16} />
                                                <span className="text-[8px] font-black uppercase mt-1">Add Tier</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                        <div className="p-6 bg-slate-50 rounded-full"><DollarSign size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-widest">Select a specialty to manage pricing</p>
                    </div>
                )}
            </div>
        </div>
    );
}