import { motion } from "framer-motion";

interface DataPoint {
    label: string;
    value: number;
}

interface TrendChartProps {
    data: DataPoint[];
    color?: string;
    height?: number;
}

export function TrendChart({ data, color = "#3b82f6", height = 80 }: TrendChartProps) {
    if (!data || data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const width = 100; // Percentage based for SVG viewBox
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - (d.value / maxVal) * height
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    return (
        <div className="w-full" style={{ height }}>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
            >
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Fill Area */}
                <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    d={areaPath}
                    fill="url(#chartGradient)"
                />

                {/* Line */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d={linePath}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data Points (Dots) */}
                {points.map((p, i) => (
                    <motion.circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="2"
                        fill={color}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 + (i * 0.1) }}
                    />
                ))}
            </svg>

            {/* Labels */}
            <div className="flex justify-between mt-2">
                {data.length > 2 && [data[0], data[data.length - 1]].map((d, i) => (
                    <span key={i} className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        {d.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
