interface ServiceCounts {
    [serviceName: string]: number;
}

export interface BookingsGroupedByDate {
    [dateString: string]: ServiceCounts;
}