import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Eye, Mail, Server } from "lucide-react";

export default function PrivacyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold">Política de Privacidad</h1>
            </div>

            <div className="max-w-3xl mx-auto p-6 space-y-8">
                <div className="text-center space-y-4 py-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">Privacidad de Datos</h2>
                    <p className="text-muted-foreground text-sm">Última actualización: 16 de enero de 2026</p>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed italic">
                    En Directorio Zona, valoramos su privacidad de la misma manera que valoramos la nuestra. Este documento explica qué datos recopilamos y cómo los protegemos.
                </p>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Eye className="w-5 h-5" />
                        <h3>1. Datos que Recopilamos</h3>
                    </div>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-4">
                        <li><strong>Identificación:</strong> Email y nombre (vía Google OAuth o registro).</li>
                        <li><strong>Ubicación:</strong> Solo si usted otorga permiso manual para encontrar negocios cercanos.</li>
                        <li><strong>Actividad:</strong> Vistas de negocios y clics en promociones (analítica anónima).</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Server className="w-5 h-5" />
                        <h3>2. Uso de la Información</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Utilizamos sus datos para personalizar su experiencia, permitirle guardar favoritos y proporcionar analíticas base a los dueños de negocios sobre el rendimiento de sus perfiles. <strong>Nunca vendemos sus datos a terceros.</strong>
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Lock className="w-5 h-5" />
                        <h3>3. Google OAuth</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Si elige iniciar sesión con Google, solo solicitamos acceso a su nombre y correo electrónico. No tenemos acceso a sus contactos ni a otros datos privados de su cuenta de Google.
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Mail className="w-5 h-5" />
                        <h3>4. Sus Derechos</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Usted tiene el derecho de acceder, rectificar o eliminar sus datos personales en cualquier momento desde la sección de **Configuración** de la aplicación.
                    </p>
                </section>

                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-xs text-center text-muted-foreground">
                        Directorio Zona cumple con las normativas locales de protección de datos personales.
                    </p>
                </div>
            </div>
        </div>
    );
}
