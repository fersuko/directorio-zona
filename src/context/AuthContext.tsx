import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Shield } from "lucide-react";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    profile: ProfileData | null;
}

interface ProfileData {
    id: string;
    role: 'user' | 'admin' | 'business_owner';
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    phone: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                console.log("[AuthContext] Initializing auth...");

                // Get the initial session with a timeout to prevent hanging
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
                    setTimeout(() => {
                        console.warn("[AuthContext] getSession timed out after 15 seconds. Proceeding with null session.");
                        resolve({ data: { session: null } });
                    }, 15000)
                );

                const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

                if (mounted) {
                    const currentUser = session?.user ?? null;
                    setUser(currentUser);
                    console.log("[AuthContext] Initial session set:", currentUser ? "User Logged In" : "No Session");

                    // Fetch profile if user exists
                    if (currentUser) {
                        try {
                            const { data: profileData, error } = await supabase
                                .from('profiles')
                                .select('id, role, full_name, email, avatar_url, phone')
                                .eq('id', currentUser.id)
                                .single();

                            if (mounted && profileData && !error) {
                                setProfile(profileData as ProfileData);
                            }
                        } catch (profileError) {
                            console.warn("[AuthContext] Error fetching profile:", profileError);
                        }
                    }

                    setIsLoading(false);
                    console.log("[AuthContext] Auth initialized successfully");
                }
            } catch (error) {
                console.error("[AuthContext] Error initializing auth:", error);
                if (mounted) {
                    // Even on error, stop loading to prevent infinite spinner
                    setUser(null);
                    setProfile(null);
                    setIsLoading(false);
                }
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log("[AuthContext] Auth state changed:", event);

                if (mounted) {
                    const currentUser = session?.user ?? null;
                    setUser(currentUser);

                    // Update profile asynchronously (non-blocking)
                    if (currentUser) {
                        // Run async operations without blocking
                        (async () => {
                            try {
                                const { data: profileData } = await supabase
                                    .from('profiles')
                                    .select('id, role, full_name, email, avatar_url, phone')
                                    .eq('id', currentUser.id)
                                    .single();

                                if (mounted && profileData) {
                                    setProfile(profileData as ProfileData);
                                }

                                // Sync profile from metadata on login if missing
                                if (event === 'SIGNED_IN' && profileData) {
                                    const metadata = currentUser.user_metadata;
                                    const fullName = metadata.full_name || metadata.name;
                                    const avatarUrl = metadata.avatar_url || metadata.picture;

                                    const profile = profileData as ProfileData;
                                    if (!profile.full_name && fullName) {
                                        await (supabase as any).from('profiles').update({
                                            full_name: fullName,
                                            avatar_url: avatarUrl || profile.avatar_url,
                                            updated_at: new Date().toISOString()
                                        }).eq('id', currentUser.id);
                                    }
                                }
                            } catch (error) {
                                console.warn("[AuthContext] Error updating profile on auth change:", error);
                            }
                        })();
                    } else {
                        setProfile(null);
                    }
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Show loading screen while initializing auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <Shield className="absolute inset-0 m-auto w-5 h-5 text-primary opacity-50" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="font-medium animate-pulse">Cargando...</p>
                        <p className="text-xs text-muted-foreground">Verificando sesión</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, profile }}>
            {children}
        </AuthContext.Provider>
    );
}
