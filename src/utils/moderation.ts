export const BAD_WORDS = [
    'pendejo', 'puto', 'puta', 'cabron', 'chinga', 'verga', 'culero', 'pinche',
    'maricon', 'zorra', 'mierda', 'estafa', 'fraude', 'spam', 'http://', 'https://'
];

export const checkContent = (text: string): { safe: boolean; reason?: string } => {
    const lowerText = text.toLowerCase();

    // Check for bad words
    for (const word of BAD_WORDS) {
        if (lowerText.includes(word)) {
            return { safe: false, reason: `Palabra prohibida detectada: ${word}` };
        }
    }

    // Check for excessive capitalization (screaming)
    const upperCount = text.replace(/[^A-Z]/g, "").length;
    if (upperCount > text.length * 0.7 && text.length > 20) {
        return { safe: false, reason: "Uso excesivo de mayúsculas" };
    }

    // Check for spam-like patterns (repetitive characters)
    if (/(.)\1{5,}/.test(lowerText)) {
        return { safe: false, reason: "Caracteres repetitivos sospechosos" };
    }

    return { safe: true };
};
