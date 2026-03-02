import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";

function getDateRange(
    range?: string
) {
    if (!range) return null;

    const today = dayjs();

    // 3. Handle custom string range (e.g., "2023-01-01 to 2023-06-01")
    if (range.includes(" to ")) {
        const [start, end] = range.split(" to ");
        const startDate = dayjs(start);
        const endDate = dayjs(end);

        if (startDate.isValid() && endDate.isValid()) {
            return [startDate.startOf("day"), endDate.endOf("day")];
        }
    }

    // 4. Named ranges
    switch (range.toLowerCase()) {
        case "last_month":
            const lastMonth = today.subtract(1, "month");
            return [lastMonth.startOf("month"), lastMonth.endOf("month")];

        case "this_month":
            return [today.startOf("month"), today.endOf("month")];

        case "last_year":
            const lastYear = today.subtract(1, "year");
            return [lastYear.startOf("year"), lastYear.endOf("year")];

        case "this_year":
            return [today.startOf("year"), today.endOf("year")];

        default:
            return null;
    }
}

export async function POST(req: Request) {
    const intent = await req.json();

    console.log("intent", intent);

    const dateRange = getDateRange(intent.date_range);

    if (intent.action === "filter_bookings") {
        let query = supabase.from("appointments").select(`*,
        service_definitions!inner (
            name,
            specialties!inner (name, slug)
        ),
        status:appointments_status_fkey (id, name),
        providers (id, fullname)`);

        if (intent.service) {
            query = query.eq("service_definitions.specialties.slug", intent.service);
        }

        if (intent.name) {
            query = query.ilike("name", `%${intent.name}%`);
        }

        if (dateRange) {
            query = query
                .gte("date", dateRange[0].format("YYYY-MM-DD"))
                .lte("date", dateRange[1].format("YYYY-MM-DD"));
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ results: data });
    }

    if (intent.action === "get_revenue") {
        let query = supabase.from("appointments").select("final_price");

        if (dateRange) {
            query = query
                .gte("date", dateRange[0].format("YYYY-MM-DD"))
                .lte("date", dateRange[1].format("YYYY-MM-DD"));
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const total = data.reduce(
            (sum: number, item: any) => sum + (item.final_price || 0),
            0
        );

        return NextResponse.json({ revenue: total });
    }

    return NextResponse.json({ message: "Not implemented yet" });
}