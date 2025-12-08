import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Store, TrendingUp, Users } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function RegisterBusinessPage() {
    const navigate = useNavigate();

    const benefits = [
        {
            icon: <Store className="w-6 h-6 text-blue-400" />,
            title: "Perfil de Negocio Premium",
            description: "Destaca con fotos, horarios y contacto directo."
        },
        {
            icon: <TrendingUp className="w-6 h-6 text-green-400" />,
            title: "Estadísticas en Tiempo Real",
            description: "Conoce cuántas personas visitan tu perfil."
        },
        {
            icon: <Users className="w-6 h-6 text-purple-400" />,
            title: "Gestión de Promociones",
            description: "Crea y administra ofertas para atraer clientes."
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
                <h1 className="text-lg font-semibold">Registra tu Negocio</h1>
            </div>

            <div className="p-6 space-y-8">
                {/* Hero */}
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
                        <Store className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">
                        Haz crecer tu negocio con <span className="text-primary">Directorio Zona</span>
                    </h2>
                    <p className="text-muted-foreground">
                        Únete a la red de negocios locales más exclusiva y llega a más clientes en tu zona.
                    </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                    {benefits.map((benefit, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-4 rounded-xl flex gap-4 items-start"
                        >
                            <div className="p-2 bg-white/5 rounded-lg shrink-0">
                                {benefit.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{benefit.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {benefit.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Pricing / CTA */}
                <div className="glass-card p-6 rounded-2xl border-primary/20 bg-primary/5 text-center space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold">Plan de Lanzamiento</h3>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-3xl font-bold">$0</span>
                            <span className="text-muted-foreground">/mes</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            *Por tiempo limitado para los primeros 50 negocios.
                        </p>
                    </div>

                    <ul className="space-y-2 text-left text-sm mx-auto max-w-[200px]">
                        <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" /> Sin comisiones
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" /> Soporte prioritario
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" /> Cancelación en cualquier momento
                        </li>
                    </ul>

                    <Button
                        variant="premium"
                        className="w-full"
                        onClick={() => window.open("https://wa.me/528112345678?text=Hola,%20quiero%20registrar%20mi%20negocio%20en%20Directorio%20Zona", "_blank")}
                    >
                        Empezar Ahora
                    </Button>
                </div>
            </div>
        </div>
    );
}
