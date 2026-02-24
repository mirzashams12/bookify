import HeatmapCalendar from "@/components/calendar/HeatmapCalendar";
import { headers } from "next/headers";
import { BookingsGroupedByDate } from "@/types/bookings";

async function getStats(): Promise<BookingsGroupedByDate> {
    const headersList = headers();
    const host = (await headersList).get("host");

    const res = await fetch(`http://${host}/api/appointments/stats`, {
        cache: "no-store",
    });

    return res.json();
}

export default async function DashboardPage() {
    const bookingsData = await getStats();

    return (
        <div className="grid grid-cols-4 gap-6">
            {/* Heatmap */}
            <div className="col-span-3">
                <HeatmapCalendar bookingsData={bookingsData} />
            </div>

            {/* Stats */}
            <div className="space-y-6">
                <div className="p-6 rounded-xl border border-zinc-800">
                    <h4 className="text-sm text-zinc-400">Total Revenue</h4>
                    <p className="text-2xl font-bold">$2,450</p>
                </div>

                <div className="p-6 rounded-xl border border-zinc-800">
                    <h4 className="text-sm text-zinc-400">New Clients</h4>
                    <p className="text-2xl font-bold">12</p>
                </div>
            </div>
        </div>
    );
}