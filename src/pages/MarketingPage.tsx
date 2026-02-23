import { motion } from "framer-motion";
import {
    MapPin,
    Zap,
    ChevronRight,
    Star,
    TrendingUp,
    CheckCircle2,
    MessageSquare
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";

export default function MarketingPage() {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const features = [
        {
            icon: <MapPin className="w-6 h-6 text-primary" />,
            title: "Ubicación Exacta",
            description: "Encuentra locales comerciales con precisión GPS real. Olvídate de las direcciones confusas."
        },
        {
            icon: <MessageSquare className="w-6 h-6 text-primary" />,
            title: "ZonaBot Inteligente",
            description: "Tu asistente local que conoce Monterrey como la palma de su mano. Recomendaciones personalizadas al instante."
        },
        {
            icon: <Zap className="w-6 h-6 text-primary" />,
            title: "Instalación PWA",
            description: "Lleva el directorio en tu bolsillo sin ocupar espacio. Rápido, ligero y siempre disponible."
        }
    ];

    const stats = [
        { value: "250+", label: "Negocios Locales" },
        { value: "15+", label: "Categorías" },
        { value: "100%", label: "Orgullo Regio" }
    ];

    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">Z</div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">Directorio Zona</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Características</a>
                        <a href="#benefits" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Beneficios</a>
                        <a href="#about" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Sobre nosotros</a>
                    </div>
                    <Link to="/">
                        <Button size="sm" className="rounded-full shadow-lg shadow-primary/20">
                            Ir a la App
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div {...fadeIn} className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                <Star className="w-3 h-3 fill-primary" />
                                El Directorio más pro de Monterrey
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1]">
                                Encuentra lo mejor de tu <span className="text-primary italic">Zona</span> con un clic.
                            </h1>
                            <p className="text-xl text-slate-600 max-w-lg">
                                La plataforma definitiva para descubrir negocios locales, promociones exclusivas y obtener ayuda de nuestro asistente inteligente.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/">
                                    <Button size="lg" className="rounded-full px-8 text-lg shadow-xl shadow-primary/30 h-14">
                                        Explorar Ahora <ChevronRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                                <Link to="/instalar">
                                    <Button variant="outline" size="lg" className="rounded-full px-8 text-lg bg-white h-14">
                                        Descargar App
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: 50 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                                <img
                                    src="/marketing/home-mockup.png"
                                    alt="App Screenshot"
                                    className="w-full object-cover"
                                />
                            </div>
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl -z-10" />
                            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary/20 rounded-full blur-3xl -z-10" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-12 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="text-center space-y-1">
                                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                                <div className="text-sm font-medium text-slate-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl italic">Tecnología al servicio de tu comunidad</h2>
                        <p className="text-lg text-slate-600 italic">
                            Hemos diseñado Directorio Zona para que la experiencia de búsqueda sea intuitiva, rápida y sobre todo, útil.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 italic">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed italic">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ZonaBot Section */}
            <section id="benefits" className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <img
                                src="/marketing/bot-mockup.png"
                                alt="ZonaBot Assistant"
                                className="rounded-3xl shadow-2xl relative z-10 border-8 border-slate-50"
                            />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-10" />
                        </motion.div>

                        <div className="space-y-8">
                            <h2 className="text-4xl font-bold text-slate-900 italic leading-tight">
                                Conoce a ZonaBot, <br />
                                <span className="text-primary italic">tu nuevo mejor amigo.</span>
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed italic">
                                ¿No sabes dónde cenar? ¿Buscas una lavandería abierta? Pregúntale a ZonaBot. Nuestra inteligencia artificial está entrenada para darte las mejores opciones basadas en tu zona.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Respuestas rápidas con jerga local",
                                    "Prioriza negocios Premium con mejores ofertas",
                                    "Conoce todas las categorías del directorio",
                                    "Disponible 24/7 en la palma de tu mano"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-slate-700 italic">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link to="/">
                                <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 mt-4">
                                    Hablar con ZonaBot
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Business Section */}
            <section className="py-24 bg-primary text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -rotate-12 translate-x-10 -translate-y-10" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl -rotate-12 -translate-x-10 translate-y-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12 relative z-10">
                    <div className="space-y-4">
                        <TrendingUp className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                        <h2 className="text-4xl font-bold italic">¿Tienes un negocio en Monterrey?</h2>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto italic">
                            Únete a cientos de comercios que ya están aumentando su visibilidad y atrayendo clientes locales con Directorio Zona.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Mayor Alcance", desc: "Llega a personas que buscan servicios en tu zona exacta." },
                            { title: "Perfil Premium", desc: "Muestra tus mejores fotos, horarios y promociones." },
                            { title: "Analytics Reales", desc: "Mira cuántas personas ven tu negocio y te contactan." },
                            { title: "Sin Comisiones", desc: "Tus clientes son tuyos. Nosotros solo los conectamos." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-left">
                                <h4 className="font-bold text-lg mb-2 italic text-yellow-300">{item.title}</h4>
                                <p className="text-sm text-white/70 italic leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8">
                        <Link to="/unete">
                            <Button size="lg" className="bg-white text-primary hover:bg-slate-50 rounded-full px-12 h-14 text-lg font-bold">
                                Registrar mi Negocio
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2 space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">Z</div>
                                <span className="text-2xl font-bold tracking-tight italic">Directorio Zona</span>
                            </div>
                            <p className="text-slate-400 max-w-sm italic">
                                La guía más completa y moderna de Monterrey. Conectamos personas con lugares, creando una comunidad local más fuerte.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h4 className="font-bold uppercase tracking-widest text-xs text-slate-500 italic">Explorar</h4>
                            <ul className="space-y-4 text-slate-400 italic">
                                <li><Link to="/" className="hover:text-white transition-colors">Mapa Interactivo</Link></li>
                                <li><Link to="/promos" className="hover:text-white transition-colors">Promociones</Link></li>
                                <li><Link to="/search" className="hover:text-white transition-colors">Búsqueda Avanzada</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="font-bold uppercase tracking-widest text-xs text-slate-500 italic">Legal</h4>
                            <ul className="space-y-4 text-slate-400 italic">
                                <li><Link to="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm italic font-medium tracking-tight h-16">
                        <p>© 2026 Directorio Zona. Todos los derechos reservados.</p>
                        <p>Hecho con ❤️ en Monterrey, México.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
