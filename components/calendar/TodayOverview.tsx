function DonutRing({ percent, color, label, subValue }: any) {
    const r = 40;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent / 100) * circ;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={r} fill="transparent" stroke="#F1F5F9" strokeWidth="10" />
                    <circle cx="50" cy="50" r={r} fill="transparent" stroke={color} strokeWidth="10"
                        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-slate-900 font-black text-xl">{percent}%</span>
                    <span className="text-slate-400 text-[10px] font-bold">{subValue}</span>
                </div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
    );
}

export default function TodayOverview({ bookings, revenue }: any) {
    return (
        <div className="flex flex-col gap-10">
            <DonutRing percent={75} color="#0EA5E9" label="Bookings Today" subValue="9/12" />
            <DonutRing percent={60} color="#22C55E" label="Revenue Today" subValue="$1,500/$2,500" />
        </div>
    );
}