export default function UpcomingDaysChart() {
    const days = [
        { date: "NOV 21", bookings: 80, revenue: 50, color: "bg-[#0EA5E9]" },
        { date: "NOV 22", bookings: 60, revenue: 40, color: "bg-[#1E40AF]" },
        { date: "NOV 23", bookings: 90, revenue: 100, color: "bg-[#22C55E]" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between h-40 px-4">
                {days.map((day) => (
                    <div key={day.date} className="flex flex-col items-center gap-4 w-full">
                        <div className={`w-10 rounded-t-xl transition-all duration-700 ${day.color}`} style={{ height: `${day.bookings}%` }} />
                        <span className="text-[9px] font-black text-slate-400">{day.date}</span>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-800" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Bookings</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Revenue</span>
                </div>
            </div>
        </div>
    );
}