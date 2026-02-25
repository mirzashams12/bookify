import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Appointment } from "@/types/appointment";

// GET /api/appointments
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const start_date = searchParams.get("startDate");
    const end_date = searchParams.get("endDate");
    const status_id = searchParams.get("status");
    const service_id = searchParams.get("service");

    let query = supabase
        .from("appointments")
        .select(`
        *,
        service:appointments_service_fkey (id, name),
        status:appointments_status_fkey (id, name)
    `, { count: "exact" });

    // Conditionally apply filters
    if (start_date) query = query.gte("date", start_date);
    if (end_date) query = query.lte("date", end_date);
    if (status_id) query = query.eq("status", status_id);
    if (service_id) query = query.eq("service", service_id);

    const { data, error, count } = await query
        .order("date", { ascending: false })
        .order("time", { ascending: false })
        .range(from, to);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        data,
        total: count,
        page,
        totalPages: Math.ceil((count || 0) / limit),
    });
}

// POST /api/appointments
export async function POST(req: Request) {
    const body = await req.json();

    const { data, error } = await supabase
        .from("appointments")
        .insert([
            {
                name: body.name,
                service: body.service,
                date: body.date,
                time: body.time,
                status: body.status,
                email: body.email
            },
        ])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data as Appointment, { status: 201 });
}
