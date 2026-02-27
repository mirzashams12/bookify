"use client";

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import BookAppointmentDrawer from './BookAppointmentDrawer';

export default function BookingDrawerContainer({ specialties = [] }: { specialties: any[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
            >
                <Plus size={16} />
                New Appointment
            </button>

            {isOpen && (
                <BookAppointmentDrawer
                    specialties={specialties}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}