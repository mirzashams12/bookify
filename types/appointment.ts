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
    service: ServiceType;
    date: string;
    time: string;
    status: StatusType;
}
