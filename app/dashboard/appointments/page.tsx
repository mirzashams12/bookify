import { Appointment } from "@/types/appointment";
import { headers } from "next/headers";
import Link from "next/link";
import { Plus, Clock, Filter, Calendar, Tag } from "lucide-react";
import FilterDropdown from "@/components/filter/FilterDropdown";

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

const formatTimeDetails = (time24: string) => {
    if (!time24) return { formatted: "N/A", period: "" };
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const formatted = `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    return { formatted, period };
};

// Updated fetcher to handle filter parameters
async function getAppointments(searchParams: { page?: string, date?: string, status?: string, service?: string }) {
    try {
        const headersList = await headers();
        const host = headersList.get("host");

        // Construct query string
        const query = new URLSearchParams({
            page: searchParams.page || "1",
            limit: "10",
            ...(searchParams.date && { date: searchParams.date }),
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

// --- Components ---

function TimeBadge({ time }: { time: string }) {
    const { formatted, period } = formatTimeDetails(time);
    const colorStyles = period === 'AM' ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-orange-50 text-orange-700 border-orange-100";
    return (
        <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold gap-1.5 ${colorStyles}`}>
            <Clock size={12} className="opacity-60" />
            <span>{formatted}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: Appointment["status"] }) {
    const statusKey = status?.name?.toLowerCase() || "unknown";
    const styles: Record<string, string> = {
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
        cancelled: "bg-rose-100 text-rose-700 border-rose-200",
        completed: "bg-indigo-100 text-indigo-700 border-indigo-200",
    };

    return (
        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${styles[statusKey] || "bg-slate-100 text-slate-500"}`}>
            {status?.name || "Unknown"}
        </span>
    );
}

export default async function AdminAppointmentsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, date?: string, status?: string, service?: string }>;
}) {
    const params = await searchParams;
    const { data: appointments, totalPages } = await getAppointments(params);
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
                    <FilterDropdown />

                    <Link href="/book" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-100">
                        <Plus size={18} strokeWidth={3} />
                        Book
                    </Link>
                </div>
            </div>

            {/* Table */}
            {appointments.length === 0 ? (
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
                            {appointments.map((appt: Appointment) => { // Fixed 'any' type error here
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
                    <div className="flex justify-between items-center p-6 border-t border-slate-100 bg-slate-50/30">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing Page {currentPage} of {totalPages}
                        </p>

                        <div className="flex gap-3">
                            {currentPage > 1 && (
                                <Link href={`?page=${currentPage - 1}`} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-all">
                                    Previous
                                </Link>
                            )}
                            {currentPage < totalPages && (
                                <Link href={`?page=${currentPage + 1}`} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition-all shadow-md shadow-slate-200">
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}