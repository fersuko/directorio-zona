import { useState } from "react";
import { Plus, Trash2, Tag, Calendar } from "lucide-react";
import { Button } from "../ui/Button";

interface Promo {
    id: number;
    title: string;
    description: string;
    active: boolean;
    expiresAt: string;
}

export function PromoManager() {
    const [promos, setPromos] = useState<Promo[]>([
        {
            id: 1,
            title: "2x1 en Cervezas",
            description: "Válido todos los jueves de 6pm a 9pm.",
            active: true,
            expiresAt: "2024-12-31",
        },
        {
            id: 2,
            title: "Postre Gratis",
            description: "En consumo mayor a $500.",
            active: false,
            expiresAt: "2024-11-30",
        },
    ]);

    const [isCreating, setIsCreating] = useState(false);

    const handleSavePromo = () => {
        const newPromo: Promo = {
            id: Date.now(),
            title: "Nueva Promo",
            description: "Descripción de prueba",
            active: true,
            expiresAt: "2024-12-31",
        };
        setPromos([...promos, newPromo]);
        setIsCreating(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Mis Promociones</h3>
                <Button onClick={() => setIsCreating(true)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nueva Promo
                </Button>
            </div>

            {isCreating && (
                <div className="glass-card p-4 rounded-xl space-y-4 border border-primary/20">
                    <h4 className="font-medium">Crear Nueva Promoción</h4>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Título (ej. 2x1 en Tacos)"
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                        />
                        <textarea
                            placeholder="Descripción y condiciones..."
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 h-20 resize-none"
                        />
                        <div className="flex gap-2">
                            <Button variant="premium" size="sm" onClick={handleSavePromo}>
                                Guardar
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => setIsCreating(false)}>
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {promos.map((promo) => (
                    <div
                        key={promo.id}
                        className={`glass-card p-4 rounded-xl flex justify-between items-start ${!promo.active ? "opacity-60" : ""
                            }`}
                    >
                        <div className="flex gap-3">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${promo.active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                <Tag className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">{promo.title}</h4>
                                <p className="text-xs text-muted-foreground">{promo.description}</p>
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground/80">
                                    <Calendar className="w-3 h-3" />
                                    <span>Vence: {promo.expiresAt}</span>
                                </div>
                            </div>
                        </div>
                        <button className="text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
