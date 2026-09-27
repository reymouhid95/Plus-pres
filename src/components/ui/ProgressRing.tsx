"use client";

import { forwardRef, type SVGProps } from "react";

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  showValue?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ProgressRing = forwardRef<SVGSVGElement, ProgressRingProps>(
  (
    {
      value,
      size = 58,
      stroke = 6,
      color = "currentColor",
      showValue = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const radius = (size - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={className}
        style={style}
        role="img"
        aria-label={`Progression : ${value}%`}
        {...props}
      >
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progress-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dashoffset 0.5s ease-out",
            filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))",
          }}
        />
        {showValue && (
          <text
            x={size / 2}
            y={size / 2}
            dominantBaseline="central"
            textAnchor="middle"
            fontSize={size / 4}
            fontWeight="bold"
            fill="currentColor"
          >
            {value}%
          </text>
        )}
      </svg>
    );
  }
);

ProgressRing.displayName = "ProgressRing";

export { ProgressRing };
export type { ProgressRingProps };