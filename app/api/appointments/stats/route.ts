import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { BookingsGroupedByDate } from "@/types/bookings";

export async function GET() {
    const { data, error } = await supabase
        .from("appointments")
        .select(`
        date,
        service:service (
          id,
          name
        )
      `);

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    const bookingsData: BookingsGroupedByDate = {};

    data.forEach((curr: any) => {
        const date = curr.date;
        const serviceId = curr.service?.id;
        const serviceName = curr.service?.name || "Unknown";

        if (!bookingsData[date]) {
            bookingsData[date] = [];
        }

        const existingService = bookingsData[date].find(
            (s) => s.id === serviceId
        );

        if (existingService) {
            existingService.count += 1;
        } else {
            bookingsData[date].push({
                id: serviceId,
                name: serviceName,
                count: 1,
                price: 100,
                duration: 60
            });
        }
    });

    return NextResponse.json(bookingsData);
}