interface StatusType {
    id: string;
    name: string;
}

interface ServiceType {
    id: string;
    name: string;
}

export interface Appointment {
    id: string;
    name: string;
    email: string;
    date: string;
    time: string;
    status: StatusType;
    // Update this from 'service' to 'service_definitions'
    service_definitions?: {
        id: string;
        name: string;
        base_duration: number;
        base_price: number;
    };
    final_duration?: number;
    final_price?: number;
    created_at?: string;
}
