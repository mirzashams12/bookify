import { NextResponse } from "next/server";
import { z } from "zod";

const IntentSchema = z.object({
    action: z.enum([
        "filter_bookings",
        "get_revenue",
        "find_all_clients",
        "find_active_clients",
        "find_inactive_clients",
        "find_all_providers",
        "find_active_providers",
        "find_inactive_providers",
        "find_all_services",
        "find_active_services",
        "find_inactive_services"

    ]),
    service: z.string().optional(),
    date_range: z.string().optional(),
    inactive_days: z.number().optional()
});

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        const aiResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: `
You are an AI assistant for a physiotherapy clinic booking system.

You must convert user queries into structured JSON.

Allowed actions:
- filter_bookings
- get_revenue
- find_active_clients
- find_inactive_clients
- find_active_providers
- find_inactive_providers
- find_active_services
- find_inactive_services

Allowed services:
- massage
- chiropractic
- physiotherapy
- accupuncture
- Osteopathy

Allowed date ranges:
- today
- tomorrow
- this_week
- last_week
- this_month
- last_month
- this_year
- last_year
- next_week
- next_month
- next_year

If no service mentioned, omit it.
If no date range mentioned, omit it.

Respond ONLY with JSON.
`
                        },
                        {
                            role: "user",
                            content: query
                        }
                    ],
                    temperature: 0
                })
            }
        );

        const data = await aiResponse.json();
        const content = data.choices[0].message.content;

        const parsed = IntentSchema.parse(JSON.parse(content));

        return NextResponse.json(parsed);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Invalid AI response" },
            { status: 400 }
        );
    }
}