import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Define as Promise
) {
    try {
        // 1. Unwrap params before accessing
        const { id } = await params;
        const body = await req.json();

        // 2. Update using the correct column names
        // Based on your GET implementation, the column is likely 'status' (the FK)
        const { data, error } = await supabase
            .from("appointments")
            .update({
                status: body.status_id, // Changed from status_id to status
                final_price: body.final_price,
                final_duration: body.final_duration
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Update Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}