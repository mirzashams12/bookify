"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, DollarSign, Clock, ChevronRight, Check } from 'lucide-react';

export default function SpecialtyPricingManager() {
    const [specialties, setSpecialties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSpecialty, setActiveSpecialty] = useState<any | null>(null);

    // Form States
    const [isAddingSpecialty, setIsAddingSpecialty] = useState(false);
    const [newSpecialtyName, setNewSpecialtyName] = useState("");
    const [isAddingService, setIsAddingService] = useState(false);
    const [newService, setNewService] = useState({ name: "", base_duration: 30, base_price: 50 });
    const [actionLoading, setActionLoading] = useState(false); // New: for button feedback

    useEffect(() => {
        fetchSpecialties();
    }, []);

    async function fetchSpecialties() {
        setLoading(true);
        try {
            const res = await fetch('/api/specialties');
            const data = await res.json();
            setSpecialties(data);
            if (activeSpecialty) {
                const updated = data.find((s: any) => s.id === activeSpecialty.id);
                setActiveSpecialty(updated || null);
            }
        } catch (error) {
            console.error("Failed to fetch specialties", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddSpecialty() {
        if (!newSpecialtyName.trim()) return;
        setActionLoading(true);

        const res = await fetch('/api/specialties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newSpecialtyName.trim() })
        });

        if (res.ok) {
            setNewSpecialtyName("");
            setIsAddingSpecialty(false);
            await fetchSpecialties();
        } else {
            const err = await res.json();
            alert(err.error || "Failed to add specialty");
        }
        setActionLoading(false);
    }

    async function handleAddService() {
        if (!newService.name.trim() || !activeSpecialty) return;
        setActionLoading(true);

        const res = await fetch('/api/services', { // Ensure this matches your route name
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...newService,
                specialty_id: activeSpecialty.id
            })
        });

        if (res.ok) {
            setNewService({ name: "", base_duration: 30, base_price: 50 });
            setIsAddingService(false);
            await fetchSpecialties();
        }
        setActionLoading(false);
    }

    async function handleDeleteSpecialty(id: string) {
        if (!confirm("Are you sure? This will delete all services and rates under this specialty.")) return;

        const res = await fetch(`/api/specialties?id=${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            if (activeSpecialty?.id === id) {
                setActiveSpecialty(null);
            }
            fetchSpecialties();
        } else {
            const err = await res.json();
            alert(err.error || "Failed to delete specialty");
        }
    }

    return (
        <div className="grid grid-cols-12 gap-8 h-[calc(100vh-250px)]">
            {/* Left Column: Specialty List */}
            <div className="col-span-4 border-r border-slate-100 pr-6 space-y-4 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Specialties</h3>
                    <button
                        type="button"
                        onClick={() => setIsAddingSpecialty(true)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {isAddingSpecialty && (
                    <div className="flex gap-2 mb-4 animate-in slide-in-from-top-2">
                        <input
                            autoFocus
                            className="flex-1 p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border border-indigo-100 text-slate-900"
                            placeholder="Specialty Name..."
                            value={newSpecialtyName}
                            onChange={(e) => setNewSpecialtyName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSpecialty()}
                        />
                        <button
                            type="button"
                            disabled={actionLoading}
                            onClick={handleAddSpecialty}
                            className="p-3 bg-indigo-600 text-white rounded-xl disabled:opacity-50"
                        >
                            <Check size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAddingSpecialty(false)}
                            className="p-3 bg-slate-100 text-slate-400 rounded-xl"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="space-y-2">
                    {specialties.map(spec => (
                        <div key={spec.id} className="group relative">
                            <button
                                type="button"
                                onClick={() => setActiveSpecialty(spec)}
                                className={`w-full flex justify-between items-center p-4 rounded-2xl text-left transition-all ${activeSpecialty?.id === spec.id ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            >
                                <span className="font-bold text-sm uppercase">{spec.name}</span>
                                <ChevronRight size={16} className={activeSpecialty?.id === spec.id ? 'opacity-100' : 'opacity-20'} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteSpecialty(spec.id)}
                                className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Service Definitions */}
            <div className="col-span-8 overflow-y-auto no-scrollbar pb-20">
                {activeSpecialty ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{activeSpecialty.name}</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase mt-1">Manage services and tiered pricing</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddingService(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:shadow-lg transition-all"
                            >
                                <Plus size={14} /> Add Service
                            </button>
                        </div>

                        {/* Add Service Inline Form */}
                        {isAddingService && (
                            <div className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100 grid grid-cols-3 gap-4 animate-in zoom-in-95">
                                <input
                                    className="col-span-3 p-4 rounded-2xl bg-white text-sm font-bold outline-none border border-transparent focus:border-indigo-300 text-slate-900"
                                    placeholder="Service Name (e.g. Initial Assessment)"
                                    value={newService.name}
                                    onChange={e => setNewService({ ...newService, name: e.target.value })}
                                />
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Duration (min)</label>
                                    <input
                                        type="number"
                                        className="w-full p-4 rounded-2xl bg-white text-sm font-bold outline-none text-slate-900"
                                        value={newService.base_duration}
                                        onChange={e => setNewService({ ...newService, base_duration: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Base Price ($)</label>
                                    <input
                                        type="number"
                                        className="w-full p-4 rounded-2xl bg-white text-sm font-bold outline-none text-slate-900"
                                        value={newService.base_price}
                                        onChange={e => setNewService({ ...newService, base_price: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={handleAddService}
                                        className="flex-1 bg-indigo-600 text-white p-4 rounded-2xl font-black text-[10px] uppercase disabled:opacity-50"
                                    >
                                        Save Service
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingService(false)}
                                        className="bg-slate-200 text-slate-600 p-4 rounded-2xl hover:bg-slate-300"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Service List */}
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
                                            <button type="button" className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><Edit2 size={18} /></button>
                                            <button type="button" className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                    {/* Rates Chart logic goes here */}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                        <div className="p-6 bg-slate-50 rounded-full shadow-inner"><DollarSign size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Select a specialty to manage pricing</p>
                    </div>
                )}
            </div>
        </div>
    );
}