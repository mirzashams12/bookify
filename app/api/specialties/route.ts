// app/api/specialties/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    const { data, error } = await supabase
        .from('specialties')
        .select(`
            id,
            name,
            is_active,
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

// POST: Create a new specialty
export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Generate a URL-friendly slug to satisfy the NOT NULL constraint
        const slug = body.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/[\s_-]+/g, '-')  // Replace spaces/underscores with hyphens
            .replace(/^-+|-+$/g, '');  // Trim hyphens

        const { data, error } = await supabase
            .from("specialties")
            .insert([{
                name: body.name,
                slug: slug,
                description: body.description || null
            }])
            .select()
            .single();

        if (error) {
            // Handle unique constraint for name or slug (Error 23505)
            if (error.code === '23505') {
                return NextResponse.json({ error: "Specialty name or slug already exists" }, { status: 400 });
            }
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH: Update an existing specialty name
export async function PATCH(req: Request) {
    const body = await req.json();
    const { id, name, is_active } = body;

    // Dynamically build update object based on what's provided
    const updateData: any = {};
    if (name !== undefined) {
        updateData.name = name;
        updateData.slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
    }
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
        .from("specialties")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const { error } = await supabase
        .from("specialties")
        .update({ is_active: false }) // Soft delete!
        .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}