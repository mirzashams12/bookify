export interface RateTier {
    duration_minutes: number;
    price: number;
}

export interface Service {
    id: string;
    name: string;
    base_duration: number;
    base_price: number;
    rates_chart?: RateTier[];
}