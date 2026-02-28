"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, DollarSign, Clock, ChevronRight, Check, AlertCircle, RotateCcw } from 'lucide-react';

export default function SpecialtyPricingManager() {
    const [specialties, setSpecialties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSpecialty, setActiveSpecialty] = useState<any | null>(null);

    // Form & UI States
    const [isAddingSpecialty, setIsAddingSpecialty] = useState(false);
    const [newSpecialtyName, setNewSpecialtyName] = useState("");
    const [editingSpecialtyId, setEditingSpecialtyId] = useState<string | null>(null);
    const [editSpecialtyName, setEditSpecialtyName] = useState("");

    const [isAddingService, setIsAddingService] = useState(false);
    const [newService, setNewService] = useState({ name: "", base_duration: 30, base_price: 50 });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchSpecialties();
    }, []);

    async function fetchSpecialties() {
        setLoading(true);
        try {
            // We pass ?all=true so the admin can see archived specialties to restore them
            const res = await fetch('/api/specialties?all=true');
            const data = await res.json();
            setSpecialties(data);

            if (activeSpecialty) {
                const updated = data.find((s: any) => s.id === activeSpecialty.id);
                setActiveSpecialty(updated || null);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
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
            fetchSpecialties();
        }
        setActionLoading(false);
    }

    async function handleUpdateSpecialty(id: string) {
        if (!editSpecialtyName.trim()) return;
        const res = await fetch('/api/specialties', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name: editSpecialtyName.trim() })
        });
        if (res.ok) {
            setEditingSpecialtyId(null);
            fetchSpecialties();
        }
    }

    async function handleToggleArchive(spec: any) {
        const action = spec.is_active ? "archive" : "restore";
        if (!confirm(`Are you sure you want to ${action} this specialty?`)) return;

        const res = await fetch('/api/specialties', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: spec.id,
                is_active: !spec.is_active
            })
        });

        if (res.ok) fetchSpecialties();
    }

    async function handleAddService() {
        if (!newService.name.trim() || !activeSpecialty) return;
        setActionLoading(true);
        const res = await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                specialty_id: activeSpecialty.id,
                name: newService.name,
                base_duration: newService.base_duration,
                base_price: newService.base_price
            })
        });
        if (res.ok) {
            setNewService({ name: "", base_duration: 30, base_price: 50 });
            setIsAddingService(false);
            fetchSpecialties();
        }
        setActionLoading(false);
    }

    async function handleDeleteService(id: string) {
        if (!confirm("Delete this service definition?")) return;
        const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
        if (res.ok) fetchSpecialties();
    }

    const handleAddTier = async (serviceId: string) => {
        const duration = prompt("Enter duration (minutes):");
        const price = prompt("Enter price ($):");
        if (!duration || !price) return;
        const res = await fetch('/api/services/rates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_definition_id: serviceId,
                duration_minutes: parseInt(duration),
                price: parseFloat(price)
            })
        });
        if (res.ok) fetchSpecialties();
    };

    const handleDeleteTier = async (tierId: string) => {
        if (!confirm("Delete this pricing tier?")) return;
        const res = await fetch(`/api/services/rates?id=${tierId}`, { method: 'DELETE' });
        if (res.ok) fetchSpecialties();
    };

    if (loading && specialties.length === 0) return <div className="p-10 text-slate-400 animate-pulse font-black uppercase text-xs">Loading configuration...</div>;

    return (
        <div className="grid grid-cols-12 gap-8 h-[calc(100vh-250px)]">
            {/* Sidebar: Specialty List */}
            <div className="col-span-4 border-r border-slate-100 pr-6 space-y-4 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Specialties</h3>
                    <button type="button" onClick={() => setIsAddingSpecialty(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                        <Plus size={16} />
                    </button>
                </div>

                {isAddingSpecialty && (
                    <div className="flex gap-2 mb-4 animate-in slide-in-from-top-2">
                        <input autoFocus className="flex-1 p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border border-indigo-100 text-slate-900" placeholder="e.g., Massage" value={newSpecialtyName} onChange={(e) => setNewSpecialtyName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSpecialty()} />
                        <button type="button" onClick={handleAddSpecialty} className="p-3 bg-indigo-600 text-white rounded-xl"><Check size={16} /></button>
                        <button type="button" onClick={() => setIsAddingSpecialty(false)} className="p-3 bg-slate-100 text-slate-400 rounded-xl"><X size={16} /></button>
                    </div>
                )}

                <div className="space-y-2">
                    {specialties.map(spec => (
                        <div key={spec.id} className={`group relative transition-all ${!spec.is_active ? 'opacity-40 grayscale' : ''}`}>
                            {editingSpecialtyId === spec.id ? (
                                <div className="flex gap-2 p-1">
                                    <input autoFocus className="flex-1 p-3 bg-white rounded-xl text-sm font-bold outline-none border border-indigo-500 text-slate-900" value={editSpecialtyName} onChange={(e) => setEditSpecialtyName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateSpecialty(spec.id)} />
                                    <button type="button" onClick={() => handleUpdateSpecialty(spec.id)} className="p-3 text-indigo-600"><Check size={18} /></button>
                                    <button type="button" onClick={() => setEditingSpecialtyId(null)} className="p-3 text-slate-400"><X size={18} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setActiveSpecialty(spec)}
                                        className={`flex-1 flex justify-between items-center p-4 rounded-2xl text-left transition-all ${activeSpecialty?.id === spec.id ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm uppercase">{spec.name}</span>
                                            {!spec.is_active && <span className="text-[7px] font-black text-red-500 uppercase tracking-tighter">Archived</span>}
                                        </div>
                                        <ChevronRight size={16} className={activeSpecialty?.id === spec.id ? 'opacity-100' : 'opacity-20'} />
                                    </button>

                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {spec.is_active ? (
                                            <>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setEditingSpecialtyId(spec.id); setEditSpecialtyName(spec.name); }} className="p-2 text-slate-300 hover:text-indigo-600 rounded-lg"><Edit2 size={14} /></button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleArchive(spec); }} className="p-2 text-red-300 hover:text-red-500 rounded-lg"><Trash2 size={14} /></button>
                                            </>
                                        ) : (
                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleArchive(spec); }} className="p-2 text-emerald-500 bg-emerald-50 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><RotateCcw size={14} /></button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content: Services */}
            <div className="col-span-8 overflow-y-auto no-scrollbar pb-20">
                {activeSpecialty ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{activeSpecialty.name}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    {!activeSpecialty.is_active && "⚠️ Archived: View-only mode"}
                                </p>
                            </div>
                            {activeSpecialty.is_active && (
                                <button type="button" onClick={() => setIsAddingService(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:shadow-lg transition-all"><Plus size={14} /> Add Service</button>
                            )}
                        </div>

                        {isAddingService && activeSpecialty.is_active && (
                            <div className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100 grid grid-cols-3 gap-4 animate-in zoom-in-95">
                                <input className="col-span-3 p-4 rounded-2xl bg-white text-sm font-bold outline-none text-slate-900" placeholder="Service Name" value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} />
                                <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Duration</label><input type="number" className="w-full p-4 rounded-2xl bg-white text-sm font-bold text-slate-900" value={newService.base_duration} onChange={e => setNewService({ ...newService, base_duration: parseInt(e.target.value) })} /></div>
                                <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Price</label><input type="number" className="w-full p-4 rounded-2xl bg-white text-sm font-bold text-slate-900" value={newService.base_price} onChange={e => setNewService({ ...newService, base_price: parseInt(e.target.value) })} /></div>
                                <div className="flex items-end gap-2">
                                    <button type="button" disabled={actionLoading} onClick={handleAddService} className="flex-1 bg-indigo-600 text-white p-4 rounded-2xl font-black text-[10px] uppercase">Save</button>
                                    <button type="button" onClick={() => setIsAddingService(false)} className="bg-slate-200 text-slate-600 p-4 rounded-2xl"><X size={18} /></button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {activeSpecialty.service_definitions?.map((service: any) => (
                                <div key={service.id} className={`bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm ${!activeSpecialty.is_active ? 'opacity-60 bg-slate-50' : ''}`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 uppercase">{service.name}</h4>
                                            <div className="flex gap-4 mt-2">
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><Clock size={12} /> {service.base_duration}m</span>
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase"><DollarSign size={12} /> ${service.base_price}</span>
                                            </div>
                                        </div>
                                        {activeSpecialty.is_active && (
                                            <button type="button" onClick={() => handleDeleteService(service.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                        )}
                                    </div>

                                    <div className="bg-slate-50/50 rounded-[24px] p-6 border border-slate-50">
                                        <div className="grid grid-cols-4 gap-3">
                                            {service.rates_chart?.map((rate: any) => (
                                                <div key={rate.id} className="relative group/tier bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
                                                    {activeSpecialty.is_active && (
                                                        <button type="button" onClick={() => handleDeleteTier(rate.id)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/tier:opacity-100 transition-opacity"><X size={10} /></button>
                                                    )}
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">{rate.duration_minutes}m</span>
                                                    <span className="text-sm font-black text-slate-900">${rate.price}</span>
                                                </div>
                                            ))}
                                            {activeSpecialty.is_active && (
                                                <button type="button" onClick={() => handleAddTier(service.id)} className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center py-4 text-slate-300 hover:border-indigo-300 hover:text-indigo-500 transition-all"><Plus size={16} /></button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                        <div className="p-6 bg-slate-50 rounded-full shadow-inner"><DollarSign size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-widest">Select a specialty to begin</p>
                    </div>
                )}
            </div>
        </div>
    );
}