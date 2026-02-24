import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Service } from "@/types/service";

// GET /api/services
export async function GET() {
    const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

    console.log(data);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data as Service[]);
}