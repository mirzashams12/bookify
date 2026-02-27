"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, FileText, Calendar as CalendarIcon, Clock, CheckCircle2, Search, UserPlus, Mail, Phone } from 'lucide-react';
import { Service } from "@/types/service";
import TimePicker from '../time/TimePicker';
import CreateClientModal from '../clients/CreateClientModal';
import DatePicker from '../date/DatePicker';

interface Client {
    id: string;
    fullname: string;
    email: string;
    phone: string;
}

export default function BookAppointmentDrawer({ services, onClose, date }: { services: Service[], onClose: () => void, date?: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isAddingClient, setIsAddingClient] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Debounced Search Logic
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedClient) return;

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const payload = {
            clientId: selectedClient.id,
            name: selectedClient.fullname,
            email: selectedClient.email,
            service: formData.get("service"),
            date: formData.get("date"),
            time: formData.get("time"),
            status: 1,
        };

        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.refresh();
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">

                    {/* Header */}
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Book Session</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Select patient and time</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-all"><X size={24} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 no-scrollbar flex flex-col">
                        <div className="space-y-10 flex-1">

                            {/* Patient Search Section */}
                            <section className="space-y-4">
                                <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <User size={14} /> Patient Information
                                </h2>

                                <div className="relative">
                                    {!selectedClient ? (
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Search name, email, or phone..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold transition-all"
                                            />

                                            {showResults && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-10 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                    <div className="max-h-64 overflow-y-auto no-scrollbar">
                                                        {clients.map(client => (
                                                            <button
                                                                key={client.id}
                                                                type="button"
                                                                onClick={() => { setSelectedClient(client); setShowResults(false); }}
                                                                className="w-full p-4 text-left hover:bg-slate-50 flex flex-col border-b border-slate-50 last:border-0"
                                                            >
                                                                <span className="font-black text-slate-900 uppercase tracking-tight text-sm">{client.fullname}</span>
                                                                <div className="flex items-center gap-4 mt-1">
                                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                                        <Mail size={10} /> {client.email}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                                        <Phone size={10} /> {client.phone}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsAddingClient(true)}
                                                            className="w-full p-4 text-left bg-indigo-50 hover:bg-indigo-100 flex items-center gap-3 text-indigo-600 font-black uppercase text-[10px] tracking-widest transition-colors"
                                                        >
                                                            <UserPlus size={16} /> New Client? Add them here
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Selected Profile Badge */
                                        <div className="flex items-center justify-between p-5 bg-indigo-50 border border-indigo-100 rounded-[24px]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-indigo-600 border border-indigo-100 text-lg uppercase">
                                                    {selectedClient.fullname.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 uppercase tracking-tight">{selectedClient.fullname}</p>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase">{selectedClient.email}</p>
                                                        <div className="w-1 h-1 bg-indigo-200 rounded-full" />
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase">{selectedClient.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setSelectedClient(null)} className="px-4 py-2 bg-white border border-indigo-100 rounded-xl text-[10px] font-black uppercase text-indigo-600 hover:text-red-500 transition-all">Change</button>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <hr className="border-slate-50" />

                            {/* Service Details */}
                            <section className="space-y-4">
                                <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <FileText size={14} /> Service Selection
                                </h2>
                                <select name="service" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold transition-all appearance-none">
                                    <option value="" disabled selected>Select a service</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Date</label>
                                        {/* New Custom Component */}
                                        <DatePicker
                                            name="date"
                                            defaultValue={date}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Time</label>
                                        <TimePicker name="time" minTime="08:00" maxTime="21:30" interval={5} />
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="pt-10 flex items-center justify-end gap-3 mt-auto">
                            <button type="button" onClick={onClose} className="px-6 py-4 text-xs font-black uppercase text-slate-400">Cancel</button>
                            <button disabled={loading || !selectedClient} className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl flex items-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-30">
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={18} />}
                                {loading ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {isAddingClient && <CreateClientModal onClose={() => setIsAddingClient(false)} />}
        </>
    );
}