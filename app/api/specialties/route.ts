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
    try {
        const body = await req.json();
        const { id, name } = body;

        if (!id || !name) {
            return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("specialties")
            .update({ name })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove a specialty
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("specialties")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}