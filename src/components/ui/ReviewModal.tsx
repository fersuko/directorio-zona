import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Loader2 } from "lucide-react";
import { Button } from "./Button";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessName: string;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    isSubmitting?: boolean;
}

export function ReviewModal({ isOpen, onClose, businessName, onSubmit, isSubmitting = false }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(rating, comment);
        // Reset only on successful submission? 
        // Typically handled by parent closing modal or we can reset here.
        // For now, consistent with previous behavior but waiting for submit.
        setRating(0);
        setComment("");
        onClose();
    };

    const getRatingLabel = (score: number) => {
        switch (score) {
            case 1: return "Malo";
            case 2: return "Regular";
            case 3: return "Bueno";
            case 4: return "Muy Bueno";
            case 5: return "¡Excelente!";
            default: return "Selecciona una calificación";
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isSubmitting ? onClose : undefined}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-card border border-border rounded-2xl p-6 z-[101] max-w-md mx-auto shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold">Calificar {businessName}</h2>
                                <p className="text-sm text-muted-foreground">
                                    Comparte tu experiencia con otros usuarios
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Star Rating */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                disabled={isSubmitting}
                                                onMouseEnter={() => !isSubmitting && setHoveredRating(star)}
                                                onMouseLeave={() => !isSubmitting && setHoveredRating(0)}
                                                onClick={() => setRating(star)}
                                                className="p-1 transition-transform hover:scale-110 focus:outline-none disabled:opacity-50 disabled:hover:scale-100"
                                            >
                                                <Star
                                                    className={`w-9 h-9 transition-colors ${star <= (hoveredRating || rating)
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-muted-foreground/30"
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <p className={`text-sm font-medium transition-all ${rating > 0 ? "text-primary" : "text-muted-foreground"}`}>
                                        {getRatingLabel(hoveredRating || rating)}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tu comentario</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="¿Qué te pareció el servicio? ¿Lo recomendarías?"
                                        className="w-full min-h-[100px] bg-muted/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none disabled:opacity-50"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="default"
                                    className="w-full h-11 text-base"
                                    disabled={rating === 0 || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Publicando...
                                        </>
                                    ) : (
                                        rating === 0 ? "Califica para publicar" : "Publicar Reseña"
                                    )}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
