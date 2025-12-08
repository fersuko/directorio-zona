import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Shield, User, Info, ChevronRight, Moon, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";

type SettingItem =
    | { type: 'toggle'; icon: React.ReactNode; label: string; value: boolean; onChange: () => void; onClick?: undefined; danger?: undefined }
    | { type: 'link'; icon: React.ReactNode; label: string; onClick: () => void; value?: undefined; onChange?: undefined; danger?: undefined }
    | { type: 'button'; icon: React.ReactNode; label: string; onClick: () => void; danger: boolean; value?: undefined; onChange?: undefined };

interface SettingSection {
    title: string;
    items: SettingItem[];
}

export default function SettingsPage() {
    const navigate = useNavigate();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(true); // Assuming dark mode is default for now

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const sections: SettingSection[] = [
        {
            title: "Preferencias",
            items: [
                {
                    icon: <Bell className="w-5 h-5 text-blue-400" />,
                    label: "Notificaciones",
                    type: "toggle",
                    value: notificationsEnabled,
                    onChange: () => setNotificationsEnabled(!notificationsEnabled)
                },
                {
                    icon: <Moon className="w-5 h-5 text-purple-400" />,
                    label: "Modo Oscuro",
                    type: "toggle",
                    value: darkMode,
                    onChange: () => setDarkMode(!darkMode)
                }
            ]
        },
        {
            title: "Cuenta y Seguridad",
            items: [
                {
                    icon: <User className="w-5 h-5 text-green-400" />,
                    label: "Editar Perfil",
                    type: "link",
                    onClick: () => navigate("/profile/edit") // Placeholder route
                },
                {
                    icon: <Shield className="w-5 h-5 text-orange-400" />,
                    label: "Privacidad y Seguridad",
                    type: "link",
                    onClick: () => window.open("#", "_blank")
                }
            ]
        },
        {
            title: "Información",
            items: [
                {
                    icon: <Info className="w-5 h-5 text-gray-400" />,
                    label: "Acerca de Directorio Zona",
                    type: "link",
                    onClick: () => { }
                },
                {
                    icon: <LogOut className="w-5 h-5 text-red-400" />,
                    label: "Cerrar Sesión",
                    type: "button",
                    onClick: handleLogout,
                    danger: true
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold">Configuración</h1>
            </div>

            <div className="p-4 space-y-6">
                {sections.map((section, idx) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="space-y-3"
                    >
                        <h2 className="text-sm font-medium text-muted-foreground px-1">
                            {section.title}
                        </h2>
                        <div className="glass-card rounded-xl overflow-hidden divide-y divide-white/5">
                            {section.items.map((item, itemIdx) => (
                                <div
                                    key={itemIdx}
                                    className={`p-4 flex items-center justify-between ${item.type !== 'toggle' ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
                                    onClick={item.type === 'link' || item.type === 'button' ? item.onClick : undefined}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white/5 ${item.danger ? 'bg-red-500/10' : ''}`}>
                                            {item.icon}
                                        </div>
                                        <span className={`font-medium ${item.danger ? 'text-red-400' : ''}`}>
                                            {item.label}
                                        </span>
                                    </div>

                                    {item.type === 'toggle' && (
                                        <div
                                            onClick={item.onChange}
                                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${item.value ? 'bg-primary' : 'bg-muted'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${item.value ? 'translate-x-5' : ''}`} />
                                        </div>
                                    )}

                                    {(item.type === 'link' || item.type === 'button') && (
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                <div className="text-center pt-8 pb-4">
                    <p className="text-xs text-muted-foreground">
                        Directorio Zona v1.2.0
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                        Hecho con ❤️ en Monterrey
                    </p>
                </div>
            </div>
        </div>
    );
}
