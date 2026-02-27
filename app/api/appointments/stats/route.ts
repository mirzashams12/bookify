import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { BookingsGroupedByDate, ServiceCount } from "@/types/bookings";

export async function GET() {
    // 1. Fetch data using the updated UUID-based relationship
    // Using !inner ensures we only get appointments with valid service data
    const { data, error } = await supabase
        .from("appointments")
        .select(`
            date,
            final_price,
            final_duration,
            service_definitions!inner (
                id,
                name
            )
        `);

    if (error) {
        console.error("Supabase Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const bookingsData: BookingsGroupedByDate = {};

    // 2. Process and group the data
    data?.forEach((curr: any) => {
        const date = curr.date;

        // Access nested join data safely
        const serviceObj = curr.service_definitions;
        const serviceId = serviceObj?.id;
        const serviceName = serviceObj?.name || "Unknown Service";

        // Ensure values are numbers (Supabase numeric/int8 often come as strings)
        const apptPrice = Number(curr.final_price) || 0;
        const apptDuration = Number(curr.final_duration) || 0;

        // Safety check to prevent grouping errors
        if (!serviceId) return;

        // Initialize the date array if it doesn't exist
        if (!bookingsData[date]) {
            bookingsData[date] = [];
        }

        // Find if this service type already exists for this specific date
        const existingServiceIndex = bookingsData[date].findIndex(
            (s) => s.id === serviceId
        );

        if (existingServiceIndex !== -1) {
            // Update existing entry: Increment count and aggregate totals
            const existing = bookingsData[date][existingServiceIndex];
            existing.count += 1;
            existing.price += apptPrice;
            existing.duration += apptDuration;
        } else {
            // Create new ServiceCount entry for this date
            const newServiceEntry: ServiceCount = {
                id: serviceId,
                name: serviceName,
                count: 1,
                price: apptPrice,
                duration: apptDuration
            };
            bookingsData[date].push(newServiceEntry);
        }
    });

    return NextResponse.json(bookingsData);
}