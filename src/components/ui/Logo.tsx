interface LogoProps {
    className?: string;
    showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative flex items-center justify-center">
                <img
                    src="/logo-pin.png"
                    alt="Directorio Zona Logo"
                    className="w-10 h-10 object-contain drop-shadow-md"
                />
            </div>
            {showText && (
                <div className="flex flex-col leading-[0.8]">
                    <span className="text-2xl font-black text-brand-blue tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]">directorio</span>
                    <span className="text-4xl font-black text-foreground/90 tracking-tighter -mt-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]" style={{ textShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 0 rgba(0,0,0,0.2)' }}>Zona</span>
                </div>
            )}
        </div>
    );
}
