import ProviderListContainer from "@/components/providers/ProviderListContainer";
import { headers } from "next/headers";

async function getProviders() {
    const headersList = await headers();
    const host = headersList.get("host");

    // Fetching providers WITH their joined specialties
    const res = await fetch(`http://${host}/api/providers`, { cache: "no-store" });
    return res.ok ? res.json() : [];
}

async function getSpecialties() {
    const headersList = await headers();
    const host = headersList.get("host");

    const res = await fetch(`http://${host}/api/specialties`, { cache: "no-store" });
    return res.ok ? res.json() : [];
}

export default async function ProvidersPage() {
    const [providers, specialties] = await Promise.all([
        getProviders(),
        getSpecialties()
    ]);

    return (
        <div className="max-w-[1400px] mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Practitioners</h1>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Clinic Staff & Specializations
                </p>
            </div>

            <ProviderListContainer
                initialProviders={providers}
                specialties={specialties}
            />
        </div>
    );
}