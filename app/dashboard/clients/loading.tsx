export default function Loading() {
    return (
        <div className="w-full">
            {/* 1. Pulse the Title */}
            <div className="h-8 w-48 bg-slate-200 rounded-md animate-pulse mb-6" />

            {/* 2. Container for the table skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">

                {/* Header Row Skeleton */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex gap-4 animate-pulse">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-4 flex-1 bg-slate-200 rounded" />
                    ))}
                </div>

                {/* Body Row Skeletons */}
                <div className="divide-y divide-slate-100">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="p-5 flex items-center justify-between animate-pulse">
                            {/* Customer Column */}
                            <div className="h-4 w-32 bg-slate-100 rounded" />
                            {/* Service Column */}
                            <div className="h-4 w-24 bg-slate-100 rounded" />
                            {/* Date Column */}
                            <div className="h-4 w-20 bg-slate-100 rounded" />
                            {/* Time Column */}
                            <div className="h-4 w-16 bg-slate-100 rounded" />
                            {/* Status Column */}
                            <div className="h-6 w-20 bg-slate-200 rounded-full" />
                            {/* Actions Column */}
                            <div className="flex gap-2">
                                <div className="h-8 w-16 bg-slate-200 rounded" />
                                <div className="h-8 w-16 bg-slate-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}