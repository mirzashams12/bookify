import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    const { data, error } = await supabase
        .from("service_definitions")
        .select(`
            *,
            rates_chart (*)
        `)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { specialty_id, name, base_duration, base_price, rates } = body;

        // 1. Insert Service Definition
        const { data: service, error: serviceError } = await supabase
            .from("service_definitions")
            .insert([{ specialty_id, name, base_duration, base_price }])
            .select()
            .single();

        if (serviceError) throw serviceError;

        // 2. Insert associated rates if they exist
        if (rates && rates.length > 0) {
            const ratesToInsert = rates.map((r: any) => ({
                service_definition_id: service.id,
                duration_minutes: r.duration_minutes,
                price: r.price
            }));

            const { error: ratesError } = await supabase
                .from("rates_chart")
                .insert(ratesToInsert);

            if (ratesError) throw ratesError;
        }

        return NextResponse.json(service, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, name, base_duration, base_price } = body;

        const { data, error } = await supabase
            .from("service_definitions")
            .update({ name, base_duration, base_price })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase
        .from("service_definitions")
        .delete()
        .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}