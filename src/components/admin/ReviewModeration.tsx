import { useState, useEffect } from "react";
import { Star, Trash2, CheckCircle, Clock, Search, Store, User } from "lucide-react";
import { Button } from "../ui/Button";
import { supabase } from "../../lib/supabase";

export function ReviewModeration() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("reviews")
                .select("*, profiles(full_name, email), businesses(name)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const { error } = await (supabase as any)
                .from("reviews")
                .update({ status: 'approved' })
                .eq("id", id);
            if (error) throw error;
            setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
        } catch (error) {
            console.error(error);
            alert("Error al aprobar");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta reseña permanentemente?")) return;
        try {
            const { error } = await supabase.from("reviews").delete().eq("id", id);
            if (error) throw error;
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error(error);
            alert("Error al eliminar");
        }
    };

    const filteredReviews = reviews.filter(r =>
        r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.businesses?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por comentario, negocio o usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-muted-foreground text-sm bg-muted/50 font-medium">
                                <th className="py-3 px-4">Usuario / Negocio</th>
                                <th className="py-3 px-4">Comentario</th>
                                <th className="py-3 px-4">Calificación</th>
                                <th className="py-3 px-4">Estado</th>
                                <th className="py-3 px-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {loading ? (
                                <tr><td colSpan={5} className="py-10 text-center animate-pulse">Cargando reseñas...</td></tr>
                            ) : filteredReviews.length === 0 ? (
                                <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No se encontraron reseñas.</td></tr>
                            ) : (
                                filteredReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <User className="w-3 h-3 text-primary" />
                                                    {review.profiles?.full_name || "Anónimo"}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Store className="w-3 h-3" />
                                                    {review.businesses?.name || "Negocio Desconocido"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-foreground max-w-xs truncate" title={review.comment}>
                                                {review.comment}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold">{review.rating}</span>
                                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {review.status === 'approved' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                                    <CheckCircle className="w-2.5 h-2.5" />
                                                    Aprobada
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {review.status !== 'approved' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleApprove(review.id)}
                                                        className="h-8 w-8 p-0 text-green-500 hover:bg-green-500/10"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(review.id)}
                                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
