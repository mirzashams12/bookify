import ClientListContainer from "@/components/clients/ClientListContainer";
import { headers } from "next/headers";

async function getClients(page: string) {
    const headersList = await headers();
    const host = headersList.get("host");

    // Pass page and limit to the API
    const res = await fetch(`http://${host}/api/clients?page=${page}&limit=10`, {
        cache: "no-store"
    });

    if (!res.ok) return { data: [], totalPages: 1 };
    return res.json();
}

export default async function ClientsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const currentPage = params.page || "1";
    const { data, totalPages } = await getClients(currentPage);

    return (
        <div className="max-w-[1400px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Clients</h1>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Manage patient profiles and insurance
                </p>
            </div>

            <ClientListContainer
                initialClients={data}
                totalPages={totalPages}
                currentPage={parseInt(currentPage)}
            />
        </div>
    );
}