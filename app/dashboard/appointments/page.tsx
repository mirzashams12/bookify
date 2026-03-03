import { headers } from "next/headers";
import FilterDropdown from "@/components/filter/FilterDropdown";
import BookingDrawerContainer from "@/components/booking/BookingDrawerContainer";
import AppointmentListContainer from "@/components/appointment/AppointmentListContainer";

async function getHostName() {
    const headersList = await headers();
    return headersList.get("host");
}

async function getAppointments(searchParams: { page?: string, startDate?: string, endDate?: string, status?: string, provider?: string }) {
    try {
        const host = await getHostName();
        const query = new URLSearchParams({
            page: searchParams.page || "1",
            limit: "10",
            ...(searchParams.startDate && { startDate: searchParams.startDate }),
            ...(searchParams.endDate && { endDate: searchParams.endDate }),
            ...(searchParams.status && { status: searchParams.status }),
            ...(searchParams.provider && { provider: searchParams.provider }),
        }).toString();

        const res = await fetch(`http://${host}/api/appointments?${query}`, { cache: "no-store" });
        return await res.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return { data: [], totalPages: 0 };
    }
}

async function getStatuses() {
    const host = await getHostName();
    const res = await fetch(`http://${host}/api/statuses`, { cache: "no-store" });
    return res.ok ? res.json() : [];
}

async function getSpecialties() {
    const host = await getHostName();
    const res = await fetch(`http://${host}/api/specialties`, { cache: "no-store" });
    return res.ok ? res.json() : [];
}

export default async function AdminAppointmentsPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string, page?: string, startDate?: string, endDate?: string, status?: string, provider?: string }>;
}) {
    const params = await searchParams;

    const [appointmentsData, statuses, specialties] = await Promise.all([
        getAppointments(params),
        getStatuses(),
        getSpecialties()
    ]);

    const appointments = appointmentsData.data || [];
    const totalPages = appointmentsData.totalPages || 0;
    const currentPage = Number(params.page || 1);
    let selectedAppointment: any = null;

    if (params?.id) {
        selectedAppointment = appointments.find((s: any) => s.id == params?.id);
    }

    return (
        <div className="max-w-[1400px] mx-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Appointments</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage and schedule clinic sessions</p>
                </div>

                <div className="flex items-center gap-3">
                    <FilterDropdown statuses={statuses} specialties={specialties} />
                    <BookingDrawerContainer specialties={specialties} />
                </div>
            </div>

            <AppointmentListContainer
                selectedAppointment={selectedAppointment}
                initialAppointments={appointments}
                statuses={statuses}
                specialties={specialties}
                totalPages={totalPages}
                currentPage={currentPage}
            />
        </div>
    );
}