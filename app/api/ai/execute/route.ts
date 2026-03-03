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

    if (intent.action === "find_active_clients") {
        let query = supabase.from("clients").select("id, fullname, email, insurance_provider").eq("is_active", true);

        if (intent.name) {
            query = query.ilike("fullname", `%${intent.name}%`);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ clients: data });
    }

    if (intent.action === "find_active_providers") {
        let query = supabase.from("providers").select("id,fullname, email, license_number").eq("is_active", true);

        if (intent.name) {
            query = query.ilike("fullname", `%${intent.name}%`);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ providers: data });
    }

    if (intent.action === "find_inactive_clients") {
        let query = supabase.from("clients").select("id, fullname, email, insurance_provider").eq("is_active", false);

        if (intent.name) {
            query = query.ilike("fullname", `%${intent.name}%`);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ client: data });
    }

    if (intent.action === "find_inactive_providers") {
        let query = supabase.from("providers").select("id, fullname, email, license_number").eq("is_active", false);

        if (intent.name) {
            query = query.ilike("fullname", `%${intent.name}%`);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ providers: data });
    }

    if (intent.action === "find_active_services") {
        let query = supabase
            .from("specialties")
            .select(`
                id,
                name,
                service_definitions (
                    id,
                    name,
                    base_duration,
                    base_price,
                    rates_chart (
                        id,
                        duration_minutes,
                        price
                    )
                )
            `).eq("is_active", true)

        if (intent.service) {
            query = query.ilike("name", `%${intent.service}%`);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ services: data });
    }

    if (intent.action === "find_inactive_services") {
        let query = supabase
            .from("specialties")
            .select(`
                id,
                name,
                service_definitions (
                    id,
                    name,
                    base_duration,
                    base_price,
                    rates_chart (
                        id,
                        duration_minutes,
                        price
                    )
                )
            `).eq("is_active", false)

        if (intent.service) {
            query = query.ilike("name", `%${intent.service}%`);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ services: data });
    }

    return NextResponse.json({ message: "Not implemented yet" });
}