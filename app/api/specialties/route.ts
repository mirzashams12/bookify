// app/api/specialties/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    const { data, error } = await supabase
        .from('specialties')
        .select(`
            id,
            name,
            service_definitions (
                id,
                name,
                base_duration,
                base_price,
                rates_chart (
                    duration_minutes,
                    price
                )
            )
        `)
        .order('name', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}