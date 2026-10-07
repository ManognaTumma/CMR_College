import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number; // e.g. 8.81 for SGPA or 87 for attendance
  max: number; // 10 for GPA, 100 for percentage
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorGradient?: [string, string];
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 180,
  strokeWidth = 14,
  label,
  sublabel,
  colorGradient = ['#0284c7', '#8b5cf6'],
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const gradientId = `grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative flex flex-col items-center justify-center inline-block">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorGradient[0]} />
            <stop offset="100%" stopColor={colorGradient[1]} />
          </linearGradient>
        </defs>

        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-700/60"
          fill="transparent"
        />

        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>

      {/* Inner Centered Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white"
        >
          {value.toFixed(max === 10 ? 2 : 1)}
          {max === 100 && <span className="text-xl font-bold">%</span>}
        </motion.span>
        {label && <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">{label}</span>}
        {sublabel && <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">{sublabel}</span>}
      </div>
    </div>
  );
};
