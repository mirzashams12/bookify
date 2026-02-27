"use client";

import HeatmapCalendar from "@/components/calendar/HeatmapCalendar";
import { BookingsGroupedByDate } from "@/types/bookings";
import {
    LineChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useMemo } from "react";
import dayjs from "dayjs";
import { Service } from "@/types/service";

interface Props {
    bookingsData: BookingsGroupedByDate;
    specialities: Service[]
}

export default function DashboardClient({ bookingsData, specialities }: Props) {
    const today = dayjs().format("YYYY-MM-DD");

    const todayData = bookingsData[today] || {};

    const todayTotal = Object.values(todayData).reduce(
        (sum: number, service: any) => sum + service.count,
        0
    );

    const chartData = useMemo(() => {
        return Object.entries(bookingsData)
            .slice(-14)
            .map(([date, services]) => ({
                date: dayjs(date).format("MMM D"),
                total: Object.values(services).reduce(
                    (sum: number, service: any) => sum + service.count,
                    0
                ),
            }));
    }, [bookingsData]);

    return (
        <div className="space-y-8">

            {/* PREMIUM HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        Overview of appointments & performance
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6">

                {/* HEATMAP */}
                <div className="col-span-3 bg-zinc-900/70 backdrop-blur rounded-2xl p-6 border border-zinc-800 shadow-xl">
                    <HeatmapCalendar bookingsData={bookingsData} specialties={specialities} />
                </div>

                {/* SIDE CARDS */}
                <div className="space-y-6">

                    {/* TODAY CARD */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-indigo-500/10 border border-indigo-500/30 backdrop-blur shadow-lg">
                        <h4 className="text-sm text-indigo-300">
                            Today's Appointments
                        </h4>
                        <p className="text-4xl font-bold text-white mt-2">
                            {todayTotal}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                            {dayjs().format("MMMM D, YYYY")}
                        </p>
                    </div>

                    {/* UPCOMING SERVICES BREAKDOWN */}
                    <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg">
                        <h4 className="text-sm text-zinc-400 mb-4">
                            Today's Services
                        </h4>

                        <div className="space-y-3">
                            {Object.values(todayData).map((service: any) => (
                                <div
                                    key={service.id}
                                    className="flex justify-between text-sm"
                                >
                                    <span className="text-zinc-300">
                                        {service.name}
                                    </span>
                                    <span className="text-white font-semibold">
                                        {service.count}
                                    </span>
                                </div>
                            ))}

                            {todayTotal === 0 && (
                                <p className="text-zinc-500 text-sm">
                                    No bookings today
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PREMIUM CHART SECTION */}
            <div className="bg-zinc-900/80 backdrop-blur rounded-2xl p-6 border border-zinc-800 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-6">
                    14 Day Booking Trend
                </h3>

                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis
                                dataKey="date"
                                stroke="#71717a"
                                tick={{ fill: "#a1a1aa" }}
                            />
                            <YAxis
                                stroke="#71717a"
                                tick={{ fill: "#a1a1aa" }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#18181b",
                                    border: "1px solid #27272a",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#6366f1"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}