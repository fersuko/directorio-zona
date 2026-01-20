import { useState, useEffect } from "react";
import { Download, Share, Smartphone, Zap, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";
import { Logo } from "../components/ui/Logo";

export default function InstallPage() {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Detect iOS
        const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isApple);

        // Detect if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        const handler = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallPrompt(null);
            setIsInstalled(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center text-center space-y-12 pb-32">

            {/* Hero Section */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6"
            >
                <div className="flex justify-center">
                    <Logo className="w-24 h-24" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Directorio Zona
                    </h1>
                    <p className="text-slate-400 font-medium">El corazón de Monterrey en tu bolsillo</p>
                </div>
            </motion.div>

            {/* Status Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-sm glass-card p-8 rounded-3xl border border-white/10 space-y-8 bg-slate-900/50 backdrop-blur-xl"
            >
                {isInstalled ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-white">¡App Instalada!</h2>
                        <p className="text-sm text-slate-400">
                            Ya puedes disfrutar de la mejor experiencia directamente desde tu menú de aplicaciones.
                        </p>
                        <Button onClick={() => window.location.href = '/'} className="w-full rounded-2xl h-12">
                            Ir al Inicio
                        </Button>
                    </div>
                ) : isIOS ? (
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold">Instalar en iPhone</h2>
                            <p className="text-sm text-slate-400">Sigue estos pasos sencillos para instalarla:</p>
                        </div>

                        <div className="space-y-6 text-left">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                <p className="text-sm text-slate-300 flex items-center gap-2">
                                    Toca el botón <Share className="w-4 h-4 text-blue-400" /> (Compartir) en tu navegador Safari.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                <p className="text-sm text-slate-300">
                                    Desliza hacia abajo y toca en <span className="text-white font-bold">"Agregar a Inicio"</span>.
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                <p className="text-sm text-slate-300">
                                    ¡Listo! El icono aparecerá junto a tus otras apps.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold">Vive la Experiencia App</h2>
                            <p className="text-sm text-slate-400">Instala ahora para disfrutar de todos los beneficios.</p>
                        </div>

                        <Button
                            onClick={handleInstall}
                            disabled={!installPrompt}
                            className="w-full h-14 rounded-2xl text-lg font-bold gap-3 shadow-xl shadow-primary/20"
                        >
                            <Download className="w-6 h-6" />
                            Instalar Ahora
                        </Button>

                        {!installPrompt && (
                            <p className="text-[10px] text-slate-500 italic">
                                * Si no aparece el botón, busca "Instalar aplicación" en el menú de tu navegador.
                            </p>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Benefits Matrix */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2">
                    <Zap className="w-6 h-6 text-yellow-400 mx-auto" />
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Más Rápida</p>
                </div>
                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2">
                    <MapPin className="w-6 h-6 text-red-500 mx-auto" />
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">GPS Exacto</p>
                </div>
                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2">
                    <Smartphone className="w-6 h-6 text-blue-400 mx-auto" />
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Icono Propio</p>
                </div>
                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto" />
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Sin Anuncios</p>
                </div>
            </div>

            <p className="text-slate-600 text-[10px] max-w-xs">
                Directorio Zona v1.0.0 - Tecnología Progressive Web App (PWA)
            </p>
        </div>
    );
}
