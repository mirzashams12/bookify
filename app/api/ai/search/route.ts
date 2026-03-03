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
  date_range: z.string().optional(),
  service: z.string().optional(),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const aiResponse = await fetch(
      `${process.env.GROQ_AI_URL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: `${process.env.GROQ_AI_MODEL}`,
          messages: [
            {
              role: "system",
              content: `You are an AI assistant for a physiotherapy clinic booking system.

                            Your task is to convert user queries into structured JSON.
                            
                            ====================
                            CRITICAL OUTPUT RULES
                            ====================
                            
                            - Always include an "action" field.
                            - "action" is REQUIRED in every response.
                            - Never return partial objects.
                            - Never omit the action.
                            - Respond ONLY with valid JSON.
                            - Do NOT include explanations.
                            - Do NOT wrap in markdown.
                            - Do NOT invent fields.
                            - Only use the allowed actions listed below.
                            
                            ====================
                            ALLOWED ACTIONS
                            ====================
                            
                            - filter_bookings
                            - get_revenue
                            - find_active_clients
                            - find_inactive_clients
                            - find_active_providers
                            - find_inactive_providers
                            - find_active_services
                            - find_inactive_services
                            
                            ====================
                            ACTION PRIORITY RULES
                            ====================
                            
                            Follow this decision order strictly:
                            
                            1. If the query mentions:
                               - booking
                               - bookings
                               - appointment
                               - appointments
                               → action = "filter_bookings"
                            
                            2. If the query mentions:
                               - revenue
                               - income
                               - earnings
                               → action = "get_revenue"
                            
                            3. If the query mentions clients or patients explicitly
                               → use appropriate client action
                            
                            4. If the query mentions providers, therapists, or doctors explicitly
                               → use appropriate provider action
                            
                            5. If the query contains:
                               - a person’s name
                               - AND a service and/or date
                               → action = "filter_bookings"
                            
                            6. If the query contains only a name:
                               - If title like Dr, Doctor, Therapist → find_active_providers
                               - Otherwise → find_active_clients
                            
                            7. If unclear but a date is present → default to "filter_bookings"
                            
                            ====================
                            SERVICE RULES
                            ====================
                            
                            Allowed services:
                            - massage-therapy
                            - chiropractic
                            - physiotherapy
                            - acupuncture
                            - osteopathy
                            
                            If a service is mentioned, include:
                            "service": "<allowed-service-slug>"
                            
                            If no service mentioned, omit it.
                            
                            ====================
                            DATE HANDLING RULES
                            ====================
                            
                            date_range must always be a SINGLE STRING if present.
                            
                            Relative mappings:
                            - yesterday
                            - today
                            - tomorrow
                            - this_week
                            - last_week
                            - next_week
                            - this_month
                            - last_month
                            - next_month
                            - this_year
                            - last_year
                            - next_year
                            
                            If user provides:
                            - explicit year (e.g., 2023)
                              → return "01 Jan 2023 to 31 Dec 2023"
                            
                            - custom range (e.g., 01 Jan 2024 to 31 Dec 2024)
                              → return exactly that format
                            
                            - between range (e.g., between dec 2024 and mar 2025)
                              → return "01 Dec 2024 to 31 Mar 2025"
                            
                            - specific month + year (e.g., Jan 2024)
                              → return "01 Jan 2024 to 31 Jan 2024"

                            - specific day (e.g., 01 Jan 2024)
                              → return "01 Jan 2024"
                            
                            Never:
                            - return a separate "year" field
                            - return date_range as an object
                            - mix relative terms with numeric years
                            - invent new date keywords
                            
                            If no date mentioned, omit it.
                            
                            ====================
                            NAME RULES
                            ====================
                            
                            If a person's name appears anywhere in the query:
                            
                            1. Include:
                               "name": "<normalized name>"
                            
                            2. If titles appear:
                               - Dr
                               - Dr.
                               - Doctor
                               - Therapist
                               - Physio
                               - Physiotherapist
                            
                               Remove the title.
                               Return only the person's actual name.
                            
                            Examples:
                            
                            Input: "Dr Alex"
                            Output:
                            {
                              "action": "find_active_providers",
                              "name": "Alex"
                            }
                            
                            Input: "Therapist Alex"
                            Output:
                            {
                              "action": "find_active_providers",
                              "name": "Alex"
                            }
                            
                            Input: "sana appointment for massage therapy next month"
                            Output:
                            {
                              "action": "filter_bookings",
                              "name": "Sana",
                              "service": "massage-therapy",
                              "date_range": "next_month"
                            }
                            
                            If a name appears inside a booking-related query,
                            treat it as a client name unless explicitly stated otherwise.
                            
                            ====================
                            FINAL RULE
                            ====================
                            
                            Return ONLY a single valid JSON object.
                            No extra text.
                            No explanations.`
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

    console.log("ai content: ", content);

    const parsed = IntentSchema.parse(JSON.parse(content));

    console.log(parsed);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Invalid AI response" },
      { status: 400 }
    );
  }
}