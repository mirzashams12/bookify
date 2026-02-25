import { Appointment } from "@/types/appointment";
import { headers } from "next/headers";
import Link from "next/link";
import { Plus, Clock, Filter, Calendar, Tag } from "lucide-react";
import FilterDropdown from "@/components/filter/FilterDropdown";
import PaginationControls from "@/components/filter/PaginationControl";
import { TimeBadge } from "@/components/badge/TimeBadge";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Status } from "@/types/status";
import { Service } from "@/types/service";

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

// Updated fetcher to handle filter parameters
async function getAppointments(searchParams: { page?: string, startDate?: string, endDate?: string, status?: string, service?: string }) {
    try {
        const host = await getHostName();

        // Construct query string
        const query = new URLSearchParams({
            page: searchParams.page || "1",
            limit: "5",
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

    const res = await fetch(`http://${host}/api/statuses`, {
        cache: "no-store",
    });

    if (!res.ok) return [];
    return res.json();
}

async function getServices() {
    const host = await getHostName();

    const res = await fetch(`http://${host}/api/services`, {
        cache: "no-store",
    });

    if (!res.ok) return [];
    return res.json();
}

export default async function AdminAppointmentsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, date?: string, status?: string, service?: string }>;
}) {
    const params = await searchParams;
    const { data: appointments, totalPages } = await getAppointments(params);

    const status: Status[] = await getStatus();
    const services: Service[] = await getServices();

    const currentPage = Number(params.page || 1);

    return (
        <div className="max-w-[1400px] mx-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Appointments</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage and schedule clinic sessions</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* NEW FLOATING FILTER */}
                    <FilterDropdown statuses={status} services={services} />

                    <Link href="/book" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-100">
                        <Plus size={18} strokeWidth={3} />
                        Book
                    </Link>
                </div>
            </div>

            {/* Table */}
            {!appointments || appointments.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-slate-200 p-20 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found</p>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
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
                            {appointments?.map((appt: Appointment) => { // Fixed 'any' type error here
                                const serviceName = appt.service?.name || 'N/A';
                                return (
                                    <tr key={appt.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-5 font-bold text-slate-900">{appt.name}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getServiceColor(serviceName)}`}>
                                                {serviceName}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-slate-600 text-sm">{appt.date}</td>
                                        <td className="px-8 py-5">
                                            <TimeBadge time={appt.time} />
                                        </td>
                                        <td className="px-8 py-5">
                                            <StatusBadge status={appt.status} />
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {appt.status?.name?.toLowerCase() === "pending" && (
                                                    <button className="px-4 py-2 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all">
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

                    {/* Pagination Bar */}
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} />
                </div>
            )}
        </div>
    );
}