import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { supabase } from "../../lib/supabase";
import { Clock, MapPin, Phone, Type, Save } from "lucide-react";

interface BusinessInfoEditorProps {
    businessId: number | string;
    initialData: any;
    onUpdate: () => void;
}

const DAYS = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
];

export function BusinessInfoEditor({ businessId, initialData, onUpdate }: BusinessInfoEditorProps) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        phone: "",
        address: "",
        opening_hours: {} as any
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                description: initialData.description || "",
                phone: initialData.phone || "",
                address: initialData.address || "",
                opening_hours: initialData.opening_hours || createDefaultHours()
            });
        }
    }, [initialData]);

    const createDefaultHours = () => {
        const defaultDay = { open: "09:00", close: "18:00", isOpen: true };
        return DAYS.reduce((acc, day) => ({ ...acc, [day.key]: defaultDay }), {});
    };

    const handleHoursChange = (dayKey: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            opening_hours: {
                ...prev.opening_hours,
                [dayKey]: {
                    ...prev.opening_hours[dayKey],
                    [field]: value
                }
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from("businesses")
                .update({
                    name: formData.name,
                    description: formData.description,
                    phone: formData.phone,
                    address: formData.address,
                    opening_hours: formData.opening_hours
                } as any)
                .eq("id", businessId);

            if (error) throw error;
            alert("¡Información actualizada!");
            onUpdate();
        } catch (error) {
            console.error("Error updating info:", error);
            alert("Error al guardar cambios.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Type className="w-4 h-4 text-primary" /> Nombre del Negocio
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Type className="w-4 h-4 text-primary" /> Descripción
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 h-24 resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" /> Teléfono
                        </label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" /> Dirección
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Horarios de Atención
                </h3>

                <div className="space-y-2">
                    {DAYS.map((day) => {
                        const dayData = formData.opening_hours?.[day.key] || { open: "09:00", close: "18:00", isOpen: true };
                        return (
                            <div key={day.key} className="flex items-center gap-2 text-sm">
                                <div className="w-24 font-medium">{day.label}</div>
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={dayData.isOpen}
                                        onChange={e => handleHoursChange(day.key, "isOpen", e.target.checked)}
                                        className="accent-primary"
                                    />
                                    {dayData.isOpen ? (
                                        <>
                                            <input
                                                type="time"
                                                value={dayData.open}
                                                onChange={e => handleHoursChange(day.key, "open", e.target.value)}
                                                className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs"
                                            />
                                            <span>-</span>
                                            <input
                                                type="time"
                                                value={dayData.close}
                                                onChange={e => handleHoursChange(day.key, "close", e.target.value)}
                                                className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs"
                                            />
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground italic text-xs">Cerrado</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar Información"}
            </Button>
        </div>
    );
}
