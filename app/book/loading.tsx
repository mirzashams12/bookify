export default function Loading() {
    return (
        <div className="max-w-3xl mx-auto py-8 space-y-8 animate-pulse">
            {/* Back Button Skeleton */}
            <div className="flex items-center gap-2 w-32 h-5 bg-slate-200 rounded-lg mb-6" />

            {/* Form Container Skeleton */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                {/* Header Skeleton */}
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 space-y-3">
                    <div className="h-8 w-48 bg-slate-200 rounded-xl" />
                    <div className="h-4 w-64 bg-slate-100 rounded-lg" />
                </div>

                {/* Form Fields Skeleton */}
                <div className="p-8 space-y-8">
                    {/* Section 1 */}
                    <div className="space-y-4">
                        <div className="h-4 w-32 bg-slate-100 rounded-md" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl" />
                            <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl" />
                        </div>
                    </div>

                    <hr className="border-slate-50" />

                    {/* Section 2 */}
                    <div className="space-y-4">
                        <div className="h-4 w-32 bg-slate-100 rounded-md" />
                        <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl w-full" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl" />
                            <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl" />
                        </div>
                    </div>

                    {/* Button Skeleton */}
                    <div className="pt-6 flex justify-end gap-3">
                        <div className="h-10 w-24 bg-slate-100 rounded-xl" />
                        <div className="h-12 w-40 bg-indigo-100 rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}