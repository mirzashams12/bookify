"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, FileText, CheckCircle2, Search, UserPlus, Mail, Phone, Plus, Minus, Check } from 'lucide-react';
import TimePicker from '../time/TimePicker';
import CreateClientModal from '../clients/CreateClientModal';
import DatePicker from '../date/DatePicker';

export default function BookAppointmentDrawer({
    specialties = [],
    onClose,
    date
}: {
    specialties: any[],
    onClose: () => void,
    date?: string
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Selection States
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const [currentDuration, setCurrentDuration] = useState<number>(0);
    const [currentPrice, setCurrentPrice] = useState<number>(0);

    // Search & UI States
    const [searchTerm, setSearchTerm] = useState("");
    const [clients, setClients] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isAddingClient, setIsAddingClient] = useState(false);

    // Derived: services for the selected specialty
    const availableServices = specialties?.find(s => s.id === selectedSpecialtyId)?.service_definitions || [];

    // Debounced Patient Search
    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (searchTerm.length > 1) {
                const res = await fetch(`/api/clients?search=${searchTerm}`);
                const result = await res.json();
                setClients(result.data || []);
                setShowResults(true);
            } else {
                setClients([]);
                setShowResults(false);
            }
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const handleServiceSelect = (def: any) => {
        setSelectedService(def);
        setCurrentDuration(def.base_duration);
        setCurrentPrice(def.base_price);
    };

    const adjustDuration = (amount: number) => {
        if (!selectedService) return;

        const newDuration = Math.max(30, currentDuration + amount);
        setCurrentDuration(newDuration);

        // Look for a specific rate in the chart for this duration
        const tier = selectedService.rates_chart?.find(
            (r: any) => r.duration_minutes === newDuration
        );

        if (tier) {
            setCurrentPrice(tier.price);
        } else {
            // Fallback: If no tier exists (e.g., 120m), add a default step price
            const lastKnownPrice = currentPrice;
            setCurrentPrice(amount > 0 ? lastKnownPrice + 50 : Math.max(0, lastKnownPrice - 50));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedClient || !selectedService) return;

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const payload = {
            clientId: selectedClient.id,      // Ensure this is the UUID from the search
            serviceId: selectedService.id,    // UUID from service_definitions
            name: selectedClient.fullname,
            email: selectedClient.email,
            duration: currentDuration,        // The value from your +/- stepper
            price: currentPrice,              // The value looked up from rates_chart
            date: formData.get("date"),
            time: formData.get("time"),
            status: 1,
        };

        const res = await fetch("/api/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            router.refresh();
            onClose();
        }
        setLoading(false);
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">

                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Book Session</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure appointment details</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-all"><X size={24} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-10">
                        {/* Patient Search */}
                        <section className="space-y-4">
                            <h2 className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-2"><User size={14} /> Patient</h2>
                            {!selectedClient ? (
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Search name, email, or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold"
                                    />
                                    {showResults && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-10 overflow-hidden">
                                            {clients.map(c => (
                                                <button key={c.id} type="button" onClick={() => { setSelectedClient(c); setShowResults(false); }} className="w-full p-4 text-left hover:bg-slate-50 border-b last:border-0">
                                                    <span className="font-black text-sm uppercase">{c.fullname}</span>
                                                    <p className="text-[10px] text-slate-400 font-bold">{c.email} • {c.phone}</p>
                                                </button>
                                            ))}
                                            <button type="button" onClick={() => setIsAddingClient(true)} className="w-full p-4 bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase text-left"><UserPlus size={16} className="inline mr-2" /> New Client</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-5 bg-indigo-50 border border-indigo-100 rounded-[24px]">
                                    <div>
                                        <p className="font-black text-indigo-900 uppercase">{selectedClient.fullname}</p>
                                        <p className="text-[10px] font-bold text-indigo-400">{selectedClient.email}</p>
                                    </div>
                                    <button type="button" onClick={() => setSelectedClient(null)} className="text-[10px] font-black text-indigo-400 hover:text-red-500 uppercase">Change</button>
                                </div>
                            )}
                        </section>

                        <hr className="border-slate-50" />

                        {/* Specialty Tabs */}
                        <section className="space-y-4">
                            <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Specialty</h2>
                            <div className="flex flex-wrap gap-2">
                                {specialties.map(spec => (
                                    <button
                                        key={spec.id}
                                        type="button"
                                        onClick={() => { setSelectedSpecialtyId(spec.id); setSelectedService(null); }}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedSpecialtyId === spec.id ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
                                    >
                                        {spec.name}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Interactive Service Card */}
                        {selectedSpecialtyId && (
                            <section className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Service Type</h2>
                                <div className="grid grid-cols-1 gap-3">
                                    {availableServices.map((def: any) => {
                                        const isSelected = selectedService?.id === def.id;
                                        return (
                                            <div
                                                key={def.id}
                                                onClick={() => handleServiceSelect(def)}
                                                className={`p-5 rounded-[28px] border transition-all cursor-pointer ${isSelected ? "border-indigo-600 bg-indigo-50 shadow-lg ring-1 ring-indigo-600" : "border-slate-100 bg-slate-50 hover:border-indigo-200"}`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className={`text-sm font-black uppercase ${isSelected ? "text-indigo-700" : "text-slate-900"}`}>{def.name}</span>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Base: {def.base_duration}m • ${def.base_price}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="flex items-center bg-white border border-indigo-100 rounded-2xl p-1 shadow-sm">
                                                            <button type="button" onClick={(e) => { e.stopPropagation(); adjustDuration(-30); }} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors"><Minus size={16} /></button>
                                                            <div className="px-4 text-center min-w-[90px]">
                                                                <p className="text-[10px] font-black text-slate-900 uppercase">{currentDuration}m</p>
                                                                <p className="text-[10px] font-black text-indigo-600 tracking-tighter">${currentPrice}</p>
                                                            </div>
                                                            <button type="button" onClick={(e) => { e.stopPropagation(); adjustDuration(30); }} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors"><Plus size={16} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Date</label>
                                <DatePicker name="date" defaultValue={date} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Time</label>
                                <TimePicker name="time" minTime="08:00" maxTime="21:30" interval={5} />
                            </div>
                        </div>

                        <div className="pt-10 mt-auto">
                            <button
                                disabled={loading || !selectedClient || !selectedService}
                                className="w-full py-4 bg-slate-900 text-white font-black rounded-[20px] uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-30"
                            >
                                {loading ? "Processing..." : "Confirm Booking"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {isAddingClient && <CreateClientModal onClose={() => setIsAddingClient(false)} />}
        </>
    );
}