import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    const { data, error } = await supabase
        .from("appointments")
        .select(`
            date,
            service:service (name)
        `);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const bookingsData = data.reduce((acc: any, curr: any) => {
        const date = curr.date;
        const serviceName = curr.service?.name || "Unknown";
        if (!acc[date]) acc[date] = {};
        acc[date][serviceName] = (acc[date][serviceName] || 0) + 1;
        return acc;
    }, {});

    return NextResponse.json(bookingsData);
}