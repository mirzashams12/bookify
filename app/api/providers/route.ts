import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const body = await req.json();

    // 1. Insert the Provider first
    const { data: provider, error: pError } = await supabase
        .from("providers")
        .insert([{
            fullname: body.fullname,
            email: body.email,
            phone: body.phone,
            license_number: body.license_number
        }])
        .select()
        .single();

    if (pError) return NextResponse.json({ error: pError.message }, { status: 500 });

    // 2. Link the selected Specialities in the join table
    if (body.specialtyIds && body.specialtyIds.length > 0) {
        const links = body.specialtyIds.map((sid: string) => ({
            provider_id: provider.id,
            specialty_id: sid
        }));

        const { error: linkError } = await supabase
            .from("provider_specialties")
            .insert(links);

        if (linkError) {
            console.error("Linking error:", linkError);
            // We don't necessarily fail the whole request, but you should log it
        }
    }

    // 3. Clear the cache so the list updates immediately
    revalidatePath('/dashboard/providers');

    return NextResponse.json(provider, { status: 201 });
}

export async function GET() {
    const { data, error } = await supabase
        .from('providers')
        .select(`
            *,
            provider_specialties (
                specialty:specialties (
                    id,
                    name
                )
            )
        `)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}


export async function PATCH(req: Request) {
    const body = await req.json();

    // 1. Update Provider Table
    const { error: pError } = await supabase
        .from("providers")
        .update({
            fullname: body.fullname,
            email: body.email,
            phone: body.phone,
            license_number: body.license_number,
            is_active: body.is_active
        })
        .eq("id", body.id);

    if (pError) return NextResponse.json({ error: pError.message }, { status: 500 });

    // 2. Clear existing specialty links
    await supabase.from("provider_specialties").delete().eq("provider_id", body.id);

    // 3. Re-insert new links
    if (body.specialtyIds && body.specialtyIds.length > 0) {
        const links = body.specialtyIds.map((sid: string) => ({
            provider_id: body.id,
            specialty_id: sid
        }));
        await supabase.from("provider_specialties").insert(links);
    }

    revalidatePath('/dashboard/providers');
    return NextResponse.json({ success: true });
}