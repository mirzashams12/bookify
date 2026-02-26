"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import BookAppointmentDrawer from "./BookAppointmentDrawer";
import { Service } from "@/types/service";

export default function BookingDrawerContainer({ services }: { services: Service[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
                <Plus size={18} strokeWidth={3} />
                Book
            </button>

            {isOpen && (
                <BookAppointmentDrawer
                    services={services}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}