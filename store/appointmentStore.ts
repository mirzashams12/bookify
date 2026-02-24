import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Appointment } from "@/types/appointment";

interface AppointmentState {
    appointments: Appointment[];
    addAppointment: (appointment: Appointment) => void;
    updateStatus: (id: string, status: Appointment["status"]) => void;
}

export const useAppointmentStore = create<AppointmentState>()(
    persist(
        (set) => ({
            appointments: [],
            addAppointment: (appointment) =>
                set((state) => ({
                    appointments: [...state.appointments, appointment],
                })),
            updateStatus: (id, status) =>
                set((state) => ({
                    appointments: state.appointments.map((appt) =>
                        appt.id === id ? { ...appt, status } : appt
                    ),
                })),
        }),
        {
            name: "appointment-storage", // localStorage key
        }
    )
);
