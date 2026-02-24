import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Status } from "@/types/status";

// GET /api/status
export async function GET() {
    const { data, error } = await supabase
        .from("status")
        .select("id, name")
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data as Status[]);
}