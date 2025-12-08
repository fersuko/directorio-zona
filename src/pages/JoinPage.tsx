import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Send, Building2, Users, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/Button";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function JoinPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        business_name: "",
        contact_name: "",
        phone: "",
        email: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from("leads")
                .insert([formData] as any);

            if (error) throw error;
            setSubmitted(true);
        } catch (error: any) {
            console.error("Error submitting lead:", error);
            alert(`Error: ${error.message || 'Desconocido'}\nDetalles: ${error.details || ''}\nHint: ${error.hint || ''}`);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-8 rounded-2xl max-w-md w-full text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold">¡Solicitud Recibida!</h2>
                    <p className="text-muted-foreground">
                        Gracias por tu interés. Nuestro equipo revisará tu solicitud y te contactará pronto al número que proporcionaste.
                    </p>
                    <Button onClick={() => navigate("/")} className="w-full">
                        Volver al Inicio
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-muted/30 py-16 px-6 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 max-w-2xl mx-auto space-y-6"
                >
                    <h1 className="text-4xl font-bold tracking-tight">
                        Haz crecer tu negocio en el <span className="text-primary">Corazón de Monterrey</span>
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Únete al directorio digital más exclusivo de la zona. Conecta con miles de clientes locales y turistas que buscan exactamente lo que ofreces.
                    </p>
                </motion.div>
            </div>

            <div className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-12 items-start max-w-5xl">
                {/* Benefits */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">¿Por qué unirte?</h2>
                        <p className="text-muted-foreground">
                            No es solo un directorio, es una plataforma de crecimiento diseñada para negocios modernos.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {[
                            {
                                icon: Users,
                                title: "Mayor Visibilidad",
                                desc: "Aparece destacado cuando los clientes buscan tu categoría."
                            },
                            {
                                icon: TrendingUp,
                                title: "Estadísticas Reales",
                                desc: "Conoce cuántas personas ven tu perfil y hacen clic en llamar."
                            },
                            {
                                icon: Building2,
                                title: "Presencia Digital Premium",
                                desc: "Tu propia página web dentro de nuestra app, con fotos, mapa y reseñas."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 + 0.2 }}
                                className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-white/5"
                            >
                                <div className="p-3 bg-primary/10 rounded-lg h-fit text-primary">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl"
                >
                    <div className="mb-6">
                        <h3 className="text-xl font-bold">Registra tu interés</h3>
                        <p className="text-sm text-muted-foreground">
                            Completa el formulario y un asesor te contactará para activar tu perfil.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre del Negocio</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                placeholder="Ej. Restaurante El Regio"
                                value={formData.business_name}
                                onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tu Nombre</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                placeholder="Ej. Juan Pérez"
                                value={formData.contact_name}
                                onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Teléfono / WhatsApp</label>
                            <input
                                required
                                type="tel"
                                className="w-full p-3 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                placeholder="Ej. 81 1234 5678"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Correo Electrónico (Opcional)</label>
                            <input
                                type="email"
                                className="w-full p-3 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                placeholder="contacto@negocio.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20 mt-4"
                            disabled={loading}
                        >
                            {loading ? "Enviando..." : (
                                <span className="flex items-center gap-2">
                                    Enviar Solicitud <Send className="w-5 h-5" />
                                </span>
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground mt-4">
                            Al enviar, aceptas ser contactado por nuestro equipo de ventas.
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
