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
    const provider_id = searchParams.get("provider");

    let query = supabase
        .from("appointments")
        .select(`
        *,
        service_definitions (
            name,
            specialties (name)
        ),
        status:appointments_status_fkey (id, name),
        providers (id, fullname)
    `, { count: "exact" });

    // Conditionally apply filters
    if (start_date) query = query.gte("date", start_date);
    if (end_date) query = query.lte("date", end_date);
    if (status_id) query = query.eq("status", status_id);
    if (provider_id) query = query.eq("provider_id", provider_id);


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

// app/api/appointments/route.ts
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { data, error } = await supabase
            .from("appointments")
            .insert([{
                client_id: body.clientId,
                provider_id: body.providerId, // Added this
                service_definition_id: body.serviceId,
                name: body.name,
                email: body.email,
                date: body.date,
                time: body.time,
                final_duration: body.duration,
                final_price: body.price,
                status: body.status || 1
            }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error("Booking Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
