import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        // 1. Fetch user from DB
        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email.toLowerCase().trim())
            .maybeSingle(); // Use maybeSingle() instead of .single()

        if (error) {
            console.error("Database Error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        if (!user) {
            console.log("User not found for email:", email);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 2. Compare Password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 3. Return user data (In a real app, set a cookie or JWT here)
        // For now, we return the user object without the password
        const { password_hash, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            user: userWithoutPassword
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}