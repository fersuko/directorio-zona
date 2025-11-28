import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Map, Search, User, Star } from "lucide-react";
import { cn } from "../lib/utils";
import { AIChatModal } from "./ai/AIChatModal";

export default function Layout() {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: "Inicio", path: "/" },
        { icon: Map, label: "Mapa", path: "/map" },
        { icon: Search, label: "Buscar", path: "/search" },
        { icon: Star, label: "Promos", path: "/promos" },
        { icon: User, label: "Perfil", path: "/profile" },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <main className="flex-1 pb-20 overflow-y-auto">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t border-border flex items-center justify-around z-50">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-6 h-6 mb-1", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <AIChatModal />
        </div>
    );
}
