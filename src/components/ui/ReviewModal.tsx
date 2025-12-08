import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";
import { Button } from "./Button";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessName: string;
    onSubmit: (rating: number, comment: string) => void;
}

export function ReviewModal({ isOpen, onClose, businessName, onSubmit }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(rating, comment);
        onClose();
        setRating(0);
        setComment("");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
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
                            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
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
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                onClick={() => setRating(star)}
                                                className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${star <= (hoveredRating || rating)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-muted-foreground/30"
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {rating === 0 && (
                                        <p className="text-xs text-red-400 font-medium">
                                            Selecciona una calificación para continuar
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tu comentario</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="¿Qué te pareció el servicio? ¿Lo recomendarías?"
                                        className="w-full min-h-[100px] bg-muted/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="default"
                                    className="w-full"
                                    disabled={rating === 0}
                                >
                                    {rating === 0 ? "Califica para publicar" : "Publicar Reseña"}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
