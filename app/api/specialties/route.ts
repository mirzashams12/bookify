import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
    // Fetch specialties along with their loosely coupled service definitions
    const { data, error } = await supabase
        .from('specialties')
        .select(`
            id,
            name,
            service_definitions (
                id,
                name,
                base_duration,
                base_price
            )
        `)
        .order('name', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}