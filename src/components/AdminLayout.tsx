import { Outlet } from "react-router-dom";

/**
 * Layout específico para rutas de administración
 * Sin footer de navegación ni chat IA, ya que esos son para usuarios finales
 */
export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
