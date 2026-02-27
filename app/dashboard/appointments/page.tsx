import { Appointment } from "@/types/appointment";
import { headers } from "next/headers";
import { Plus, Clock, Filter, Calendar, Tag } from "lucide-react";
import FilterDropdown from "@/components/filter/FilterDropdown";
import PaginationControls from "@/components/filter/PaginationControl";
import { TimeBadge } from "@/components/badge/TimeBadge";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Status } from "@/types/status";
import BookingDrawerContainer from "@/components/booking/BookingDrawerContainer";

// --- Helpers ---
const getServiceColor = (name: string = "default") => {
    const colors = [
        "bg-blue-50 text-blue-700 border-blue-100",
        "bg-purple-50 text-purple-700 border-purple-100",
        "bg-pink-50 text-pink-700 border-pink-100",
        "bg-cyan-50 text-cyan-700 border-cyan-100",
        "bg-teal-50 text-teal-700 border-teal-100",
        "bg-indigo-50 text-indigo-700 border-indigo-100",
        "bg-violet-50 text-violet-700 border-violet-100",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

async function getHostName() {
    const headersList = await headers();
    return headersList.get("host");
}

async function getAppointments(searchParams: { page?: string, startDate?: string, endDate?: string, status?: string, service?: string }) {
    try {
        const host = await getHostName();
        const query = new URLSearchParams({
            page: searchParams.page || "1",
            limit: "10",
            ...(searchParams.startDate && { startDate: searchParams.startDate }),
            ...(searchParams.endDate && { endDate: searchParams.endDate }),
            ...(searchParams.status && { status: searchParams.status }),
            ...(searchParams.service && { service: searchParams.service }),
        }).toString();

        const res = await fetch(`http://${host}/api/appointments?${query}`, { cache: "no-store" });
        return await res.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return { data: [], totalPages: 0 };
    }
}

async function getStatus() {
    const host = await getHostName();
    const res = await fetch(`http://${host}/api/statuses`, { cache: "no-store" });
    return res.ok ? res.json() : [];
}

// Fetch Specialties with nested Definitions instead of flat services
async function getSpecialties() {
    const host = await getHostName();
    const res = await fetch(`http://${host}/api/specialties`, { cache: "no-store" });
    return res.ok ? res.json() : [];
}

export default async function AdminAppointmentsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, date?: string, status?: string, service?: string }>;
}) {
    const params = await searchParams;

    // Concurrent data fetching for better performance
    const [appointmentsData, status, specialties] = await Promise.all([
        getAppointments(params),
        getStatus(),
        getSpecialties()
    ]);

    const appointments = appointmentsData.data || [];
    const totalPages = appointmentsData.totalPages || 0;
    const currentPage = Number(params.page || 1);

    return (
        <div className="max-w-[1400px] mx-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Appointments</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage and schedule clinic sessions</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Pass specialties to support categorized filtering */}
                    <FilterDropdown statuses={status} specialties={specialties} />

                    {/* Pass specialties to populate the booking drawer categories */}
                    <BookingDrawerContainer specialties={specialties} />
                </div>
            </div>

            {!appointments || appointments.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-slate-200 p-20 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found</p>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-5 text-left">Customer</th>
                                    <th className="px-8 py-5 text-left">Service</th>
                                    <th className="px-8 py-5 text-left">Date</th>
                                    <th className="px-8 py-5 text-left">Time</th>
                                    <th className="px-8 py-5 text-left">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {appointments.map((appt: Appointment) => {
                                    // Handles the new nested service definition structure
                                    const serviceName = appt.service_definitions?.name || 'Standard Session';
                                    return (
                                        <tr key={appt.id} className="group hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-5 font-bold text-slate-900 uppercase text-sm">
                                                {appt.name}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getServiceColor(serviceName)}`}>
                                                    {serviceName}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 font-bold text-slate-600 text-sm">{appt.date}</td>
                                            <td className="px-8 py-5"><TimeBadge time={appt.time} /></td>
                                            <td className="px-8 py-5"><StatusBadge status={appt.status} /></td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {appt.status?.name?.toLowerCase() === "pending" && (
                                                        <button className="px-4 py-2 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md active:scale-95">
                                                            Approve
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} />
                </div>
            )}
        </div>
    );
}