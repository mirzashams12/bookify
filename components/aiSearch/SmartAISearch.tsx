"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Search, Loader2, TrendingUp, XCircle, Calendar,
    ArrowUpRight, Users, ShieldCheck, Activity, Briefcase,
    Layers, AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function SmartAISearch() {
    const [aiQuery, setAiQuery] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);
    const resultRef = useRef<HTMLDivElement>(null);

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
            setAiResult({ error: "Could not process AI request." });
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="relative hidden lg:block" ref={resultRef}>
            {/* Search Input */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:scale-110 transition-transform" size={16} />
                <input
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
                    placeholder="Search for revenue, clients, providers or services..."
                    className="w-[450px] pl-10 pr-10 py-2.5 bg-slate-100/50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all"
                />
                {aiLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-indigo-600" size={16} />}
            </div>

            {/* AI RESULT PANEL */}
            {aiResult && (
                <div className="absolute top-full left-0 mt-4 w-[500px] bg-white border border-slate-100 rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.2)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                                <Activity size={14} />
                            </div>
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Bookify AI Result</span>
                        </div>
                        <button onClick={() => setAiResult(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <XCircle size={20} />
                        </button>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto p-4 no-scrollbar space-y-4">

                        {/* 1. REVENUE SECTION */}
                        {aiResult.revenue !== undefined && (
                            <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[28px] text-white relative overflow-hidden group">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase opacity-50 tracking-[0.2em]">Calculated Revenue</p>
                                    <p className="text-4xl font-black mt-2 tracking-tighter italic">₹{aiResult.revenue.toLocaleString()}</p>
                                </div>
                                <TrendingUp className="absolute right-[-20px] bottom-[-20px] text-white/5 w-32 h-32" />
                            </div>
                        )}

                        {/* 2. BOOKINGS / APPOINTMENTS SECTION */}
                        {aiResult.results && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Found Appointments</p>
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{aiResult.results.length}</span>
                                </div>
                                {aiResult.results.length === 0 ? <EmptyState /> : (
                                    aiResult.results.map((item: any) => (
                                        <ResultLink key={item.id} href={`/dashboard/appointments?id=${item.id}`} icon={<Calendar size={18} />} title={item.name} sub={`${item.service_definitions?.name || 'Session'} • ${item.date}`} />
                                    ))
                                )}
                            </div>
                        )}

                        {/* 3. CLIENTS SECTION */}
                        {(aiResult.clients || aiResult.client) && (
                            <div className="space-y-2">
                                <p className="px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Records</p>
                                {(aiResult.clients || aiResult.client).map((c: any, i: number) => (
                                    <ResultLink key={i} href={`/dashboard/clients?id=${c.id}`} icon={<Users size={18} />} title={c.fullname} sub={`${c.email} • ${c.insurance_provider || 'Self Pay'}`} />
                                ))}
                            </div>
                        )}

                        {/* 4. PROVIDERS SECTION */}
                        {aiResult.providers && (
                            <div className="space-y-2">
                                <p className="px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Healthcare Providers</p>
                                {aiResult.providers.map((p: any, i: number) => (
                                    <ResultLink key={i} href={`/dashboard/providers?id=${p.id}`} icon={<ShieldCheck size={18} />} title={p.fullname} sub={`${p.email} • Lic: ${p.license_number}`} />
                                ))}
                            </div>
                        )}

                        {/* 5. SERVICES / SPECIALTIES SECTION */}
                        {aiResult.services && (
                            <div className="space-y-2">
                                <p className="px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Catalog Services</p>
                                {aiResult.services.map((s: any, i: number) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-xs font-black text-slate-900 uppercase flex items-center gap-2">
                                            <Layers size={14} className="text-indigo-500" /> {s.name}
                                        </p>
                                        <div className="mt-2 pl-6 space-y-1">
                                            {s.service_defenitions?.map((def: any, j: number) => (
                                                <p key={j} className="text-[10px] font-bold text-slate-500 uppercase">• {def.name}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error Handling */}
                        {aiResult.error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 animate-shake">
                                <AlertCircle className="text-red-500 shrink-0" size={20} />
                                <p className="text-[10px] font-bold text-red-600 uppercase leading-tight">{aiResult.error}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50/80 text-center border-t border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Bookify Intelligence v1.1 • Natural Language Search</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper UI Components
function ResultLink({ href, icon, title, sub }: { href: string, icon: any, title: string, sub: string }) {
    return (
        <Link href={href} className="flex items-center gap-4 p-4 hover:bg-indigo-50/50 rounded-2xl transition-all group border border-transparent hover:border-indigo-100">
            <div className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                {icon}
            </div>
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
        <div className="py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <Search size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase italic">No records matched your criteria</p>
        </div>
    );
}