import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ActionMenuItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "danger";
    show?: boolean;
}

interface ActionMenuProps {
    items: ActionMenuItem[];
}

export function ActionMenu({ items }: ActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const visibleItems = items.filter(item => item.show !== false);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Acciones"
            >
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-2 w-48 bg-card border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden"
                    >
                        {visibleItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    item.onClick();
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${item.variant === "danger"
                                        ? "hover:bg-red-500/10 text-red-400"
                                        : "hover:bg-white/5 text-foreground"
                                    }`}
                            >
                                <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
