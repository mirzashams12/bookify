export interface ServiceCount {
    id: string;
    name: string;
    count: number;
    price: number;
    duration: number;
}

export interface BookingsGroupedByDate {
    [dateString: string]: ServiceCount[];
}