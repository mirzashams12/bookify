import HeatmapCalendar from "@/components/calendar/HeatmapCalendar";
import TodayOverview from "@/components/calendar/TodayOverview";
import UpcomingDaysChart from "@/components/calendar/UpcomingDaysChart";
import { Search } from "lucide-react";
import { headers } from "next/headers";

async function getStats() {
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
        <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.05)] animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row gap-16">

                {/* Left Section: Calendar */}
                <div className="flex-1 min-w-0">
                    <HeatmapCalendar bookingsData={bookingsData} />
                </div>

                {/* Right Section: Analytics Panel */}
                <div className="w-full lg:w-80 space-y-16">
                    <section>
                        <h4 className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.25em] mb-10">
                            Today's Overview
                        </h4>
                        <TodayOverview
                            bookings={{ current: 9, target: 12 }}
                            revenue={{ current: 1500, target: 2500 }}
                        />
                    </section>

                    <section>
                        <h4 className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.25em] mb-10">
                            Upcoming Days
                        </h4>
                        <UpcomingDaysChart />
                    </section>
                </div>
            </div>
        </div>
    );
}