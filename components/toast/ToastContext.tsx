"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastType } from '@/components/toast/Toast';

interface ToastContextType {
    showToast: (message: string, type: ToastType) => string;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType }[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        return id;
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onClose={hideToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
};