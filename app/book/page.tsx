import { Service } from "@/types/service";
import { headers } from "next/headers";
import BookAppointmentForm from "@/components/booking/BookingForm"; // Import the form below

async function getServices(): Promise<Service[]> {
    const headersList = await headers();
    const host = headersList.get("host");

    const res = await fetch(`http://${host}/api/services`, {
        cache: "no-store",
    });

    if (!res.ok) return [];
    return res.json();
}

export default async function BookAppointmentPage({
    searchParams,
}: {
    searchParams: Promise<{ date?: string }>;
}) {
    const services = await getServices();
    const { date } = await searchParams;

    const sanitizedDate = date ? date.replace(/\//g, '-') : undefined;

    return (
        <div className="max-w-3xl mx-auto">
            <BookAppointmentForm services={services} date={sanitizedDate} />
        </div>
    );
}