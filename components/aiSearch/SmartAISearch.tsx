"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Search, Loader2, TrendingUp, XCircle, Calendar,
    ArrowUpRight, Users, ShieldCheck, Activity,
    Layers, HelpCircle, Clock
} from "lucide-react";
import Link from "next/link";

export default function SmartAISearch() {
    const [aiQuery, setAiQuery] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const clearSearch = () => {
        setAiQuery("");
        setAiResult(null);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resultRef.current && !resultRef.current.contains(event.target as Node)) {
                setAiResult(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAISearch = async () => {
        if (!aiQuery.trim()) return;
        setAiLoading(true);
        setAiResult(null);

        try {
            const intentRes = await fetch("/api/ai/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: aiQuery }),
            });
            const intent = await intentRes.json();
            if (intent.error) throw new Error(intent.error);

            const executeRes = await fetch("/api/ai/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(intent),
            });
            const result = await executeRes.json();
            setAiResult(result);
        } catch (error) {
            // Setting a generic error flag instead of the message
            setAiResult({ _isError: true });
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="relative hidden lg:block" ref={resultRef}>
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:scale-110 transition-transform" size={16} />
                <input
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
                    placeholder="Search revenue, clients, or service pricing..."
                    className="w-[450px] pl-10 pr-10 py-2.5 bg-slate-100/50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all"
                />
                {aiLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-indigo-600" size={16} />}
                {aiQuery && !aiLoading && (
                    <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                        <XCircle size={14} />
                    </button>
                )}
            </div>

            {aiResult && (
                <div className="absolute top-full left-0 mt-4 w-[500px] bg-white border border-slate-100 rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.15)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                                <Activity size={14} />
                            </div>
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Bookify AI Result</span>
                        </div>
                        <button onClick={clearSearch} className="text-slate-400 hover:text-slate-600 transition-colors"><XCircle size={20} /></button>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto p-4 no-scrollbar space-y-4">

                        {/* Generic Error / Try Again State */}
                        {aiResult._isError && (
                            <div className="py-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <HelpCircle className="text-slate-300" size={32} />
                                </div>
                                <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight">Something went wrong</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Please try searching with a different phrase</p>
                            </div>
                        )}

                        {/* Revenue */}
                        {aiResult.revenue !== undefined && (
                            <div className="p-6 bg-slate-900 rounded-[28px] text-white relative overflow-hidden group">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase opacity-50 tracking-[0.2em]">Total Revenue</p>
                                    <p className="text-4xl font-black mt-2 tracking-tighter italic">₹{aiResult.revenue.toLocaleString()}</p>
                                </div>
                                <TrendingUp className="absolute right-[-20px] bottom-[-20px] text-white/5 w-32 h-32" />
                            </div>
                        )}

                        {/* Bookings */}
                        {aiResult.results && (
                            <div className="space-y-2">
                                <p className="px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Appointments</p>
                                {aiResult.results.length === 0 ? <EmptyState /> : (
                                    aiResult.results.map((item: any) => (
                                        <ResultLink key={item.id} onClick={clearSearch} href={`/dashboard/appointments?id=${item.id}`} icon={<Calendar size={18} />} title={item.name} sub={`${item.service_definitions?.name} • ${item.date}`} />
                                    ))
                                )}
                            </div>
                        )}

                        {/* Services Detail View */}
                        {aiResult.services && (
                            <div className="space-y-4">
                                <p className="px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Service Catalog</p>
                                {aiResult.services.map((specialty: any, i: number) => (
                                    <div key={i} className="bg-slate-50/50 border border-slate-100 rounded-[28px] overflow-hidden">
                                        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                                            <Layers size={14} className="text-indigo-500" />
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{specialty.name}</span>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {specialty.service_definitions?.map((def: any, j: number) => (
                                                <div key={j} className="p-4 bg-white rounded-2xl border border-transparent hover:border-indigo-100 transition-all group">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{def.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Clock size={10} className="text-indigo-400" />
                                                                <p className="text-[10px] font-bold text-indigo-600 uppercase">Base: {def.base_duration}m • ₹{def.base_price}</p>
                                                            </div>
                                                        </div>
                                                        <ArrowUpRight size={14} className="text-slate-200 group-hover:text-indigo-500 transition-colors" />
                                                    </div>
                                                    {def.rates_chart?.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-slate-50 grid grid-cols-2 gap-2">
                                                            {def.rates_chart.map((rate: any, k: number) => (
                                                                <div key={k} className="flex items-center justify-between px-3 py-2 bg-slate-50/50 rounded-xl">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase">{rate.duration_minutes}m</span>
                                                                    <span className="text-[10px] font-black text-slate-700">₹{rate.price}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Clients & Providers */}
                        {(aiResult.clients || aiResult.client || aiResult.providers) && (
                            <div className="space-y-2">
                                <p className="px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Profiles Found</p>
                                {(aiResult.clients || aiResult.client || aiResult.providers).map((item: any, i: number) => (
                                    <ResultLink key={i} onClick={clearSearch} href={`/dashboard/${aiResult.providers ? 'providers' : 'clients'}?id=${item.id}`} icon={aiResult.providers ? <ShieldCheck size={18} /> : <Users size={18} />} title={item.fullname} sub={item.email} />
                                ))}
                            </div>
                        )}

                    </div>
                    <div className="p-4 bg-slate-50/80 text-center border-t border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Try again with a more specific query if needed</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function ResultLink({ href, icon, title, sub, onClick }: any) {
    return (
        <Link href={href} onClick={onClick} className="flex items-center gap-4 p-4 hover:bg-indigo-50/50 rounded-2xl transition-all group border border-transparent hover:border-indigo-100">
            <div className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 truncate">{sub}</p>
            </div>
            <ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-all opacity-0 group-hover:opacity-100" />
        </Link>
    );
}

function EmptyState() {
    return (
        <div className="py-10 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <Search size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase italic">No matches found. Try again.</p>
        </div>
    );
}