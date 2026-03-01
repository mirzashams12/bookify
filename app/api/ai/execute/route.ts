import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";

function getDateRange(range?: string) {
    if (!range) return null;

    const today = dayjs();

    // 1. Handle specific year (e.g., "2024")
    if (/^\d{4}$/.test(range)) {
        const year = dayjs().year(parseInt(range));
        return [year.startOf("year"), year.endOf("year")];
    }

    // 2. Handle custom range (e.g., "2023-01-01 to 2023-06-01")
    if (range.includes(" to ")) {
        const [start, end] = range.split(" to ");
        const startDate = dayjs(start);
        const endDate = dayjs(end);
        if (startDate.isValid() && endDate.isValid()) {
            return [startDate.startOf("day"), endDate.endOf("day")];
        }
    }

    // 3. Handle named ranges
    switch (range.toLowerCase()) {
        case "yesterday":
            const yesterday = today.subtract(1, "day");
            return [yesterday.startOf("day"), yesterday.endOf("day")];
        case "today":
            return [today.startOf("day"), today.endOf("day")];
        case "tomorrow":
            const tomorrow = today.add(1, "day");
            return [tomorrow.startOf("day"), tomorrow.endOf("day")];

        case "last_week":
            const lastWeek = today.subtract(1, "week");
            return [lastWeek.startOf("week"), lastWeek.endOf("week")];
        case "this_week":
            return [today.startOf("week"), today.endOf("week")];
        case "next_week":
            const nextWeek = today.add(1, "week");
            return [nextWeek.startOf("week"), nextWeek.endOf("week")];

        case "last_month":
            const lastMonth = today.subtract(1, "month");
            return [lastMonth.startOf("month"), lastMonth.endOf("month")];
        case "this_month":
            return [today.startOf("month"), today.endOf("month")];
        case "next_month":
            const nextMonth = today.add(1, "month");
            return [nextMonth.startOf("month"), nextMonth.endOf("month")];

        case "last_year":
            const lastYear = today.subtract(1, "year");
            return [lastYear.startOf("year"), lastYear.endOf("year")];
        case "this_year":
            return [today.startOf("year"), today.endOf("year")];
        case "next_year":
            const nextYear = today.add(1, "year");
            return [nextYear.startOf("year"), nextYear.endOf("year")];

        default:
            return null;
    }
}

export async function POST(req: Request) {
    const intent = await req.json();

    if (intent.action === "filter_bookings") {
        let query = supabase.from("appointments").select(`*,
        service_definitions (
            name,
            specialties (name)
        ),
        status:appointments_status_fkey (id, name),
        providers (id, fullname)`);

        if (intent.service) {
            query = query.eq("service_name", intent.service);
        }

        const dateRange = getDateRange(intent.date_range);

        if (dateRange) {
            console.log("start date", dateRange[0], "---", "end date", dateRange[1]);
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
        const dateRange = getDateRange(intent.date_range);

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