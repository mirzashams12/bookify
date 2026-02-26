import ClientListContainer from "@/components/clients/ClientListContainer";
import { Plus } from "lucide-react";

async function getClients() {
    // Replace with your actual DB fetch
    const res = await fetch(`http://localhost:3000/api/clients`, { cache: "no-store" });
    return res.json();
}

export default async function ClientsPage() {
    const clients: any[] = []; // await getClients();

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Clients</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Manage your patient database
                    </p>
                </div>
            </div>

            {/* Passing data to a Client Component to handle search/modals */}
            <ClientListContainer initialClients={clients} />
        </div>
    );
}