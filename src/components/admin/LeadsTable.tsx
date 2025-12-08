import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Phone, Mail, Calendar, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { Button } from "../ui/Button";

export interface Lead {
    id: string;
    business_name: string;
    contact_name: string;
    phone: string;
    email: string;
    status: 'pending' | 'contacted' | 'closed' | 'rejected';
    notes: string;
    created_at: string;
}

interface LeadsTableProps {
    onConvert?: (lead: Lead) => void;
}

export function LeadsTable({ onConvert }: LeadsTableProps) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const { data, error } = await supabase
                .from("leads")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: Lead['status']) => {
        try {
            const { error } = await (supabase
                .from("leads") as any)
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            setLeads(prev => prev.map(lead =>
                lead.id === id ? { ...lead, status: newStatus } : lead
            ));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error al actualizar estado");
        }
    };

    const getStatusColor = (status: Lead['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
            case 'contacted': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
            case 'closed': return 'bg-green-500/20 text-green-500 border-green-500/30';
            case 'rejected': return 'bg-red-500/20 text-red-500 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-500';
        }
    };

    const getStatusLabel = (status: Lead['status']) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'contacted': return 'Contactado';
            case 'closed': return 'Cerrado';
            case 'rejected': return 'Rechazado';
            default: return status;
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando solicitudes...</div>;

    return (
        <div className="space-y-4">
            <div className="grid gap-4">
                {leads.map((lead) => (
                    <div key={lead.id} className="glass-card p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-lg">{lead.business_name}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(lead.status)}`}>
                                        {getStatusLabel(lead.status)}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <UsersIcon className="w-4 h-4" /> {lead.contact_name}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Phone className="w-4 h-4" /> {lead.phone}
                                    </div>
                                    {lead.email && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" /> {lead.email}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(lead.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-start md:self-center">
                                {lead.status === 'pending' && (
                                    <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700"
                                        onClick={() => updateStatus(lead.id, 'contacted')}
                                    >
                                        <MessageSquare className="w-4 h-4 mr-1" /> Marcar Contactado
                                    </Button>
                                )}
                                {lead.status === 'contacted' && (
                                    <>
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => {
                                                updateStatus(lead.id, 'closed');
                                                if (onConvert) onConvert(lead);
                                            }}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" /> Aprobar y Crear
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            onClick={() => updateStatus(lead.id, 'rejected')}
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {leads.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No hay solicitudes pendientes.
                    </div>
                )}
            </div>
        </div>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
