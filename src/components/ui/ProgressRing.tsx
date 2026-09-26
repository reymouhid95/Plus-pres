"use client";

import { useEffect, useState } from "react";

type ProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
};

export default function ProgressRing({
  value,
  size = 84,
  stroke = 8,
  color = "var(--color-accent)",
  className = "",
}: ProgressRingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - ((mounted ? clamped : 0) / 100) * circumference;

  return (
    <div
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Compatibilité ${clamped} %`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <span
        className="absolute font-display font-semibold tabular-nums"
        style={{ fontSize: Math.round(size * 0.26) }}
      >
        {clamped}
        <span style={{ fontSize: Math.round(size * 0.14) }}>%</span>
      </span>
    </div>
  );
}
