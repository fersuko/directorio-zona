export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    role: 'user' | 'business_owner' | 'admin'
                    full_name: string | null
                    phone: string | null
                    avatar_url: string | null
                    notifications_enabled: boolean
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    role?: 'user' | 'business_owner' | 'admin'
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    notifications_enabled?: boolean
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    role?: 'user' | 'business_owner' | 'admin'
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    notifications_enabled?: boolean
                    updated_at?: string | null
                }
            }
            businesses: {
                Row: {
                    id: string
                    owner_id: string
                    name: string
                    description: string | null
                    category: string | null
                    address: string | null
                    location: any | null // PostGIS types are complex in JS
                    images: string[] | null
                    is_premium: boolean
                    is_hidden: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    name: string
                    description?: string | null
                    category?: string | null
                    address?: string | null
                    location?: any | null
                    images?: string[] | null
                    is_premium?: boolean
                    is_hidden?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    name?: string
                    description?: string | null
                    category?: string | null
                    address?: string | null
                    location?: any | null
                    images?: string[] | null
                    is_premium?: boolean
                    is_hidden?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            promotions: {
                Row: {
                    id: string
                    business_id: string
                    title: string
                    description: string | null
                    discount_percentage: number | null
                    valid_until: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    business_id: string
                    title: string
                    description?: string | null
                    discount_percentage?: number | null
                    valid_until?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    business_id?: string
                    title?: string
                    description?: string | null
                    discount_percentage?: number | null
                    valid_until?: string | null
                    created_at?: string
                }
            }
        }
    }
}
