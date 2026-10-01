import React from 'react';

interface ProgressBarProps {
  value: number; // 0 - 100
  label?: string;
  subLabel?: string;
  color?: 'amber' | 'emerald' | 'blue' | 'rose' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  subLabel,
  color = 'amber',
  size = 'md',
  showPercentage = true,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const colorClasses = {
    amber: 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    emerald: 'bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    blue: 'bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]',
    rose: 'bg-gradient-to-r from-rose-600 to-pink-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
    purple: 'bg-gradient-to-r from-purple-600 to-indigo-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
  };

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-200">{label}</span>
            {subLabel && <span className="text-slate-400 text-xs">{subLabel}</span>}
          </div>
          {showPercentage && (
            <span className="font-semibold text-amber-400 tracking-wider">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-900/90 rounded-full overflow-hidden border border-slate-800 ${heightClasses[size]}`}>
        <div
          className={`${heightClasses[size]} rounded-full transition-all duration-700 ease-out ${colorClasses[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
