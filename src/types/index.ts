export interface Business {
    id: number;
    name: string;
    category: string;
    lat: number;
    lng: number;
    address: string;
    description: string;
    isPremium: boolean;
    image?: string;
}

export interface Promotion {
    id: string;
    businessId: number;
    title: string;
    description: string;
    discount: string;
    expiresAt: string;
}
