"use client";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import { useTransition } from "react";

export default function PaginationControls({
    currentPage,
    totalPages
}: {
    currentPage: number,
    totalPages: number
}) {
    const router = useRouter();
    const searchParams = useSearchParams(); // Get current URL params
    const [isPending, startTransition] = useTransition();

    const handlePageChange = (newPage: number) => {
        // 1. Create a new URLSearchParams object from current ones
        const params = new URLSearchParams(searchParams.toString());

        // 2. Update only the page parameter
        params.set("page", newPage.toString());

        startTransition(() => {
            // 3. Push the full merged string (e.g., ?page=2&service=2&status=1)
            router.push(`?${params.toString()}`);
        });
    };

    return (
        <div className="flex justify-between items-center p-6 border-t border-slate-100 bg-slate-50/30">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-3">
                {isPending && (
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                )}
                {currentPage > 1 && (
                    <button
                        disabled={isPending}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-all disabled:opacity-50"
                    >
                        Previous
                    </button>
                )}
                {currentPage < totalPages && (
                    <button
                        disabled={isPending}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition-all shadow-md shadow-slate-200 disabled:opacity-50"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}