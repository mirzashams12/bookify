"use client";

import React, { useState } from "react";
import { Search, UserPlus, ShieldCheck, Mail, Phone, Edit2, MoreVertical, Trash2, Power, PowerOff } from "lucide-react";
import CreateClientModal from "./CreateClientModal";
import PaginationControls from "@/components/filter/PaginationControl";

export default function ClientListContainer({ initialClients, totalPages, currentPage }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const handleEdit = (client: any) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This action is permanent.")) return;
        const res = await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
        if (res.ok) window.location.reload();
    };

    const toggleStatus = async (client: any) => {
        await fetch(`/api/clients`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: client.id, is_active: !client.is_active }),
        });
        window.location.reload();
    };

    return (
        <div className="space-y-6">
            {/* Top Bar (Same as before) */}
            <div className="flex gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[24px] outline-none focus:border-indigo-500 font-bold text-slate-600" />
                </div>
                <button onClick={() => { setEditingClient(null); setIsModalOpen(true); }} className="px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2">
                    <UserPlus size={18} /> Add Client
                </button>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Insurance</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {initialClients.map((client: any) => (
                            <tr key={client.id} className={`group hover:bg-slate-50/50 transition-all ${!client.is_active ? 'opacity-50 grayscale' : ''}`}>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-slate-200 uppercase">
                                            {client.fullname?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 uppercase tracking-tight text-sm">{client.fullname}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{client.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    {client.insuranceProvider ? (
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase border border-emerald-100">
                                            {client.insuranceProvider}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-300 uppercase italic">Self-Pay</span>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-right relative">
                                    <div className="flex justify-end items-center gap-2">
                                        <button onClick={() => handleEdit(client)} className="p-2.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                                            <Edit2 size={16} />
                                        </button>

                                        {/* Meaningful More Actions */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === client.id ? null : client.id)}
                                                className="p-2.5 hover:bg-slate-100 text-slate-400 rounded-xl transition-all"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeDropdown === client.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                                                    <button onClick={() => toggleStatus(client)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-[11px] font-black text-slate-600 uppercase tracking-tight">
                                                        {client.is_active ? <PowerOff size={14} className="text-amber-500" /> : <Power size={14} className="text-emerald-500" />}
                                                        {client.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <div className="h-[1px] bg-slate-50 my-1" />
                                                    <button onClick={() => handleDelete(client.id)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-[11px] font-black text-red-500 uppercase tracking-tight">
                                                        <Trash2 size={14} />
                                                        Delete Permanently
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <PaginationControls currentPage={currentPage} totalPages={totalPages} />
            </div>

            {isModalOpen && (
                <CreateClientModal
                    client={editingClient}
                    onClose={() => { setIsModalOpen(false); setEditingClient(null); }}
                />
            )}
        </div>
    );
}