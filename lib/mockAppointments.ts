import { Appointment } from "@/types/appointment";

export const mockAppointments: Appointment[] = [
    {
        id: "1",
        name: "Alex Paul",
        service: "Consultation",
        date: "2026-02-10",
        time: "10:00",
        status: "pending",
    },
    {
        id: "2",
        name: "Sarah Smith",
        service: "Demo Session",
        date: "2026-02-11",
        time: "14:30",
        status: "confirmed",
    },
];
