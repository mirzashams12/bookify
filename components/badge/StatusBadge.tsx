import { Appointment } from "@/types/appointment";

export function StatusBadge({ status }: { status: Appointment["status"] }) {
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