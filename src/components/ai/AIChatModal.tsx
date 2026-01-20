import { useState, useRef, useEffect } from "react";
import { X, Send, User, Bot } from "lucide-react";
import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useBusinesses } from "../../hooks/useBusinesses";
import { CATEGORY_MAP } from "../../constants/categories";

interface Message {
    id: number;
    text: string;
    sender: "user" | "ai";
}

function ZonaBotAvatar({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <div className={`relative ${className} flex items-center justify-center overflow-visible`}>
            {/* The circular background with brand gradient */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0033CC] to-[#FF0000] shadow-lg" />

            {/* The robot face (original icon) in white */}
            <div className="relative z-10 w-[60%] h-[60%] flex items-center justify-center text-white">
                <Bot className="w-full h-full" strokeWidth={2} />
            </div>
        </div>
    );
}

export function AIChatModal() {
    const { businesses } = useBusinesses();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "¡Qué onda compadre! Soy ZonaBot, tu guía matón en el mero centro de Monterrey. 🌮🍺 ¿Qué se te antoja hoy?",
            sender: "ai",
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newUserMessage: Message = {
            id: Date.now(),
            text: inputValue,
            sender: "user",
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue("");
        setIsTyping(true);

        // --- REAL HELP SEARCH LOGIC ---
        setTimeout(() => {
            const query = newUserMessage.text.toLowerCase();

            // 1. Identify intent by category keywords
            let matchedCategory: string | null = null;
            for (const [catId, info] of Object.entries(CATEGORY_MAP)) {
                if (info.keywords.some(kw => query.includes(kw))) {
                    matchedCategory = catId;
                    break;
                }
            }

            // 2. Filter businesses
            const relatedBusinesses = businesses.filter(b => {
                const nameMatch = b.name.toLowerCase().includes(query);
                const descMatch = b.description?.toLowerCase().includes(query);
                const catMatch = matchedCategory ? b.category === matchedCategory : false;
                // Also check if the raw category string includes any keyword if no direct category match
                const rawCatMatch = b.category.toLowerCase().includes(query);

                return nameMatch || descMatch || catMatch || rawCatMatch;
            });

            // 3. Prioritize Premium
            const premiumMatches = relatedBusinesses.filter(b => b.isPremium);
            const standardMatches = relatedBusinesses.filter(b => !b.isPremium);

            let aiResponseText = "";

            if (relatedBusinesses.length > 0) {
                if (premiumMatches.length > 0) {
                    const best = premiumMatches[Math.floor(Math.random() * premiumMatches.length)];
                    aiResponseText = `¡Nombre compadre! Te traigo una joyita. Tienes que ir a **${best.name}**. Es de nuestros lugares premium y está en ${best.address}. `;

                    if (premiumMatches.length > 1) {
                        const others = premiumMatches.filter(b => b.id !== best.id).slice(0, 2);
                        if (others.length > 0) {
                            aiResponseText += `También están con madre ${others.map(b => b.name).join(' y ')}.`;
                        }
                    } else if (standardMatches.length > 0) {
                        aiResponseText += `O si buscas algo más tranqui, date una vuelta por ${standardMatches[0].name}.`;
                    }
                } else {
                    const best = standardMatches[0];
                    const catInfo = matchedCategory ? CATEGORY_MAP[matchedCategory] : null;
                    const catText = catInfo ? `en la categoría de ${catInfo.label}` : `de ese tipo`;

                    aiResponseText = `Fíjate que encontré **${best.name}** ${catText}. Se encuentra en ${best.address}. ¿Te late?`;
                }
            } else {
                // Out of context handler or general greetings
                if (query.includes("hola") || query.includes("buen")) {
                    aiResponseText = "¡Qué onda! Soy ZonaBot. ¿En qué soy bueno? Te puedo recomendar donde comer, echar trago o algún local de salud o servicios aquí en el centro de Monterrey.";
                } else if (query.includes("recomienda") || query.includes("mejor") || query.includes("top")) {
                    const allPremium = businesses.filter(b => b.isPremium);
                    if (allPremium.length > 0) {
                        const best = allPremium[Math.floor(Math.random() * allPremium.length)];
                        aiResponseText = `¡Claro compadre! De lo más top aquí en el centro te recomiendo **${best.name}**. Es un lugar Premium y se la rifan bastante. Está en ${best.address}.`;
                    } else {
                        aiResponseText = "Ahorita estoy checando qué hay de nuevo, pero si me dices qué categoría buscas (comida, salud, etc.) te encuentro algo de volada.";
                    }
                } else if (query.includes("salud") || query.includes("doctor") || query.includes("enfermo")) {
                    aiResponseText = "Para temas de salud, te recomiendo buscar clínicas o consultorios aquí en el centro. Deja veo qué tenemos... ¡Ah caray! No veo uno registrado justo ahorita con ese nombre, pero busca 'Salud' en el mapa.";
                } else if (query.includes("directorio") || query.includes("zona")) {
                    aiResponseText = "Soy el alma del Directorio Zona. Mi misión es que encuentres lo mejor de Monterrey sin perder el tiempo. ¡Pregúntame lo que sea del centro!";
                } else {
                    aiResponseText = "Chale, no encontré nada exactamente así en nuestro directorio ahorita. Pero si buscas algo de comer, servicios o una lavandería, ¡aquí tengo la lista! ¿Qué más se te ofrece?";
                }
            }

            const newAiMessage: Message = {
                id: Date.now() + 1,
                text: aiResponseText,
                sender: "ai",
            };

            setMessages((prev) => [...prev, newAiMessage]);
            setIsTyping(false);
        }, 1200);
    };

    return (
        <>
            {/* Floating Button with "Clippy" style animation */}
            <motion.button
                animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-20 right-4 z-40 w-16 h-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center transition-all overflow-visible ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
                    }`}
            >
                <ZonaBotAvatar className="w-12 h-12" />
            </motion.button>

            {/* Chat Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-4 right-4 z-50 w-[90vw] max-w-sm h-[500px] bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    className="flex items-center justify-center overflow-visible"
                                >
                                    <ZonaBotAvatar className="w-10 h-10 shadow-lg" />
                                </motion.div>
                                <div>
                                    <h3 className="font-bold text-sm text-white">ZonaBot</h3>
                                    <p className="text-[10px] text-green-400 flex items-center gap-1 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        LISTO PA' LA CHAMBA
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                                        }`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-visible ${msg.sender === "user"
                                            ? "bg-brand-red/10 text-brand-red border border-brand-red/20"
                                            : ""
                                            }`}
                                    >
                                        {msg.sender === "user" ? (
                                            <User className="w-4 h-4" />
                                        ) : (
                                            <ZonaBotAvatar className="w-full h-full" />
                                        )}
                                    </div>
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted text-foreground rounded-tl-none"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center overflow-visible">
                                        <ZonaBotAvatar className="w-full h-full" />
                                    </div>
                                    <div className="bg-muted p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-white/10 bg-white/5">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 bg-background/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="w-10 h-10 rounded-xl p-0 flex items-center justify-center"
                                    disabled={!inputValue.trim() || isTyping}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
