import { Clock } from "lucide-react";

const formatTimeDetails = (time24: string) => {
    if (!time24) return { formatted: "N/A", period: "" };
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const formatted = `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    return { formatted, period };
};

export function TimeBadge({ time }: { time: string }) {
    const { formatted, period } = formatTimeDetails(time);
    const colorStyles = period === 'AM' ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-orange-50 text-orange-700 border-orange-100";
    return (
        <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold gap-1.5 ${colorStyles}`}>
            <Clock size={12} className="opacity-60" />
            <span>{formatted}</span>
        </div>
    );
}