export interface Plan {
    id: 'free' | 'launch' | 'exchange' | 'premium';
    name: string;
    description: string;
    price: number;
    features: string[];
}

export interface Business {
    id: string;
    name: string;
    category: string;
    group: string;
    lat: number;
    lng: number;
    address: string;
    description: string;
    isPremium: boolean; // Computed from plan
    planId?: 'free' | 'launch' | 'exchange' | 'premium';
    ownerId?: string;
    image?: string;
    rating?: number;
    reviewCount?: number;
    isHidden?: boolean; // Controls visibility in app
    phone?: string;
    website?: string;
}

export interface Promotion {
    id: string;
    businessId: string;
    title: string;
    description: string;
    discount: string;
    expiresAt: string;
}

export interface Review {
    id: string;
    business_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
    };
}
