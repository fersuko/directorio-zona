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
                <div className="flex flex-col leading-none">
                    <span className="text-xl font-bold text-brand-blue tracking-tight">directorio</span>
                    <span className="text-2xl font-bold text-foreground/80 -mt-1 tracking-tighter">Zona</span>
                </div>
            )}
        </div>
    );
}
