export interface Plan {
    id: 'free' | 'launch' | 'featured';
    name: string;
    description: string;
    price: number;
    features: string[];
}

export interface Business {
    id: number;
    name: string;
    category: string;
    group: string;
    lat: number;
    lng: number;
    address: string;
    description: string;
    isPremium: boolean; // Computed from plan
    planId?: 'free' | 'launch' | 'featured';
    ownerId?: string;
    image?: string;
    rating?: number;
    reviewCount?: number;
    isHidden?: boolean; // Controls visibility in app
}

export interface Promotion {
    id: string;
    businessId: number;
    title: string;
    description: string;
    discount: string;
    expiresAt: string;
}

export interface Review {
    id: string;
    business_id: number;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
    };
}
