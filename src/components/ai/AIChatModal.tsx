import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useBusinesses } from "../../hooks/useBusinesses";

interface Message {
    id: number;
    text: string;
    sender: "user" | "ai";
}

export function AIChatModal() {
    const { businesses } = useBusinesses();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "¡Qué onda compadre! Soy ZonaBot. ¿Buscas algo matón en el centro de Monterrey? 🌮🍺",
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

            // Search in our businesses
            const relatedBusinesses = businesses.filter(b =>
                b.name.toLowerCase().includes(query) ||
                b.category.toLowerCase().includes(query) ||
                b.description?.toLowerCase().includes(query)
            );

            // Prioritize Premium
            const premiumMatches = relatedBusinesses.filter(b => b.isPremium);
            const standardMatches = relatedBusinesses.filter(b => !b.isPremium);

            let aiResponseText = "";

            if (relatedBusinesses.length > 0) {
                if (premiumMatches.length > 0) {
                    const best = premiumMatches[0];
                    aiResponseText = `¡Excelente elección! Te recomiendo mucho visitar **${best.name}**. Es de nuestros lugares premium en ${best.address}. `;
                    if (premiumMatches.length > 1) {
                        aiResponseText += `También tengo en la mira a ${premiumMatches.slice(1, 3).map(b => b.name).join(' y ')}.`;
                    }
                } else {
                    const best = standardMatches[0];
                    aiResponseText = `Encontré **${best.name}** en la categoría de ${best.category}. Se encuentra en ${best.address}. ¿Te gustaría saber más?`;
                }
            } else {
                // Out of context handler
                if (query.includes("hola") || query.includes("que onda")) {
                    aiResponseText = "¡Qué onda! Soy tu guía especializado. Pregúntame por comida, tragos o servicios aquí en el centro de Monterrey.";
                } else if (query.includes("directorio") || query.includes("zona")) {
                    aiResponseText = "Soy el alma del Directorio Zona. Mi misión es que encuentres lo mejor de Monterrey sin perder el tiempo.";
                } else {
                    aiResponseText = "Chale, no encontré nada exactamente así en nuestro directorio. Pero si buscas algo de comer, beber o servicios, ¡soy experto! ¿Qué se te antoja?";
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
                    y: [0, -10, 0],
                    rotate: [0, -5, 5, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                whileHover={{ scale: 1.1, y: -15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-brand-blue to-brand-red shadow-lg flex items-center justify-center text-white transition-all overflow-hidden ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
                    }`}
            >
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
                <Bot className="w-7 h-7 relative z-10" />
                <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1"
                >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                </motion.div>
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
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-brand-blue" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">ZonaBot</h3>
                                    <p className="text-xs text-green-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        Al cien
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
                                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === "user"
                                            ? "bg-brand-red/10 text-brand-red"
                                            : "bg-brand-blue/10 text-brand-blue"
                                            }`}
                                    >
                                        {msg.sender === "user" ? (
                                            <User className="w-4 h-4" />
                                        ) : (
                                            <Bot className="w-4 h-4" />
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
                                    <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex-shrink-0 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-brand-blue" />
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
