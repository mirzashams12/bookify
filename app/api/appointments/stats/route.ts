// app/api/appointments/stats/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    // 1. Fetch appointments including provider details
    const { data, error } = await supabase
        .from("appointments")
        .select(`
            date,
            final_price,
            final_duration,
            providers!inner (
                id,
                fullname
            )
        `);

    if (error) {
        console.error("Supabase Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const bookingsData: Record<string, any[]> = {};

    // 2. Process and group the data by Provider
    data?.forEach((curr: any) => {
        const date = curr.date;
        const providerObj = curr.providers;
        const providerId = providerObj?.id;
        const providerName = providerObj?.fullname || "Unknown Provider";

        const apptPrice = Number(curr.final_price) || 0;
        const apptDuration = Number(curr.final_duration) || 0;

        if (!providerId) return;

        if (!bookingsData[date]) {
            bookingsData[date] = [];
        }

        const existingProviderIndex = bookingsData[date].findIndex(
            (p) => p.id === providerId
        );

        if (existingProviderIndex !== -1) {
            const existing = bookingsData[date][existingProviderIndex];
            existing.count += 1;
            existing.price += apptPrice;
            existing.duration += apptDuration;
        } else {
            bookingsData[date].push({
                id: providerId,
                name: providerName, // This is now Provider Name
                count: 1,
                price: apptPrice,
                duration: apptDuration
            });
        }
    });

    return NextResponse.json(bookingsData);
}