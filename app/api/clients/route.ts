import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Client } from "@/types/client";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    // BRANCH: Quick Search for Booking Drawer
    if (search) {
        const { data, error } = await supabase
            .from("clients")
            .select("id, fullname, email, phone")
            .or(`fullname.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
            .eq("is_active", true)
            .limit(5);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ data });
    }

    // BRANCH: Paginated List for Main Table
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
        .from("clients")
        .select("*", { count: 'exact' })
        .order("fullname", { ascending: true })
        .range(from, to);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
        data,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page
    });
}

// POST /api/clients
export async function POST(req: Request) {
    const body = await req.json();

    const { data, error } = await supabase
        .from("clients")
        .insert([
            {
                fullname: body.fullname,
                email: body.email,
                phone: body.phone,
                insurance_provider: body.insurance_provider,
                policy_number: body.policy_number,
                member_id: body.member_id,
                is_active: body.is_active
            },
        ])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data as Client, { status: 201 });
}

export async function PATCH(req: Request) {
    const body = await req.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
        .from("clients")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    revalidatePath('/dashboard/clients');
    return NextResponse.json(data);
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    revalidatePath('/dashboard/clients');
    return NextResponse.json({ success: true });
}