"use client";

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

export default function Toast({ id, message, type, onClose }: ToastProps) {
    useEffect(() => {
        if (type !== 'loading') {
            const timer = setTimeout(() => onClose(id), 4000);
            return () => clearTimeout(timer);
        }
    }, [id, type, onClose]);

    const icons = {
        success: <CheckCircle2 className="text-emerald-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-indigo-500" size={20} />,
        loading: <Loader2 className="text-indigo-500 animate-spin" size={20} />
    };

    const colors = {
        success: "border-emerald-100 bg-white",
        error: "border-red-100 bg-white",
        info: "border-indigo-100 bg-white",
        loading: "border-slate-100 bg-white"
    };

    return (
        <div className={`
            flex items-center gap-4 p-4 min-w-[320px] max-w-md border rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.08)]
            animate-in slide-in-from-right-full fade-in duration-500
            ${colors[type]}
        `}>
            <div className="shrink-0">{icons[type]}</div>
            <div className="flex-1">
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight italic">
                    {type === 'loading' ? 'Processing...' : type}
                </p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">{message}</p>
            </div>
            <button
                onClick={() => onClose(id)}
                className="p-1 hover:bg-slate-50 rounded-lg text-slate-300 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
}