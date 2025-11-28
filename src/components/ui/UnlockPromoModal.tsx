import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Check, Lock } from "lucide-react";
import { Button } from "./Button";
import confetti from "canvas-confetti";

interface UnlockPromoModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessName: string;
}

export function UnlockPromoModal({ isOpen, onClose, businessName }: UnlockPromoModalProps) {
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);

    const handleUnlock = () => {
        setIsUnlocking(true);

        // Simulate API call / validation
        setTimeout(() => {
            setIsUnlocking(false);
            setIsUnlocked(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 9999
            });
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-background border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Close Button */}
                        {!isUnlocked && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}

                        <div className="p-6 text-center space-y-6">
                            {/* Icon */}
                            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                {isUnlocked ? (
                                    <Check className="w-10 h-10 text-white" />
                                ) : (
                                    <Gift className="w-10 h-10 text-white" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">
                                    {isUnlocked ? "¡Promoción Activada!" : "Desbloquear Promo"}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {isUnlocked
                                        ? `Muestra este código en ${businessName} para canjear tu descuento.`
                                        : `Estás en ${businessName}. Desbloquea tu recompensa exclusiva.`}
                                </p>
                            </div>

                            {/* Action Area */}
                            {isUnlocked ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-muted p-4 rounded-xl border border-dashed border-primary/50"
                                >
                                    <p className="text-xs text-muted-foreground mb-1">CÓDIGO DE CANJE</p>
                                    <p className="text-2xl font-mono font-bold tracking-widest text-primary">
                                        ZONA-{Math.floor(Math.random() * 10000)}
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-600 flex items-center gap-2 justify-center">
                                        <Lock className="w-3 h-3" />
                                        Requiere estar en el local
                                    </div>

                                    <Button
                                        onClick={handleUnlock}
                                        disabled={isUnlocking}
                                        variant="premium"
                                        className="w-full h-12 text-lg relative overflow-hidden"
                                    >
                                        {isUnlocking ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Validando...
                                            </div>
                                        ) : (
                                            "Desbloquear Ahora"
                                        )}
                                    </Button>
                                </div>
                            )}

                            {isUnlocked && (
                                <Button onClick={onClose} variant="secondary" className="w-full">
                                    Cerrar
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
