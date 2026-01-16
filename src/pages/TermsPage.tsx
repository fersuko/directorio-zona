import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Gavel, Scale, Lock } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function TermsPage() {
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
                <h1 className="text-lg font-semibold">Términos y Condiciones</h1>
            </div>

            <div className="max-w-3xl mx-auto p-6 space-y-8">
                <div className="text-center space-y-4 py-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                        <Gavel className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">Términos de Servicio</h2>
                    <p className="text-muted-foreground text-sm">Última actualización: 16 de enero de 2026</p>
                </div>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <ShieldCheck className="w-5 h-5" />
                        <h3>1. Aceptación de los Términos</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Al acceder y utilizar Directorio Zona, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá utilizar nuestro servicio.
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Scale className="w-5 h-5" />
                        <h3>2. Uso del Servicio</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Directorio Zona es una plataforma de guía comercial. Los usuarios pueden buscar negocios, ver promociones y dejar reseñas. Los dueños de negocios son responsables de la veracidad de la información publicada sobre sus establecimientos.
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Lock className="w-5 h-5" />
                        <h3>3. Cuentas de Usuario</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. Nos reservamos el derecho de suspender o eliminar cuentas que violen nuestras políticas de comunidad o realicen actividades fraudulentas.
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <ShieldCheck className="w-5 h-5" />
                        <h3>4. Propiedad Intelectual</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Todo el contenido original de Directorio Zona (diseño, código, logotipos) es propiedad nuestra. El contenido de los negocios (logos, fotos de locales) pertenece a sus respectivos dueños, quienes nos otorgan una licencia para mostrarlo en la plataforma.
                    </p>
                </section>

                <div className="p-6 bg-muted/30 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="font-bold">¿Tienes dudas legales?</h4>
                    <p className="text-sm text-muted-foreground">
                        Si necesitas una aclaración sobre estos términos, puedes contactar con nuestro equipo legal a través de la administración.
                    </p>
                    <Button variant="outline" className="w-full" onClick={() => window.open('mailto:legal@directoriozona.com')}>
                        Contactar Soporte
                    </Button>
                </div>
            </div>
        </div>
    );
}
