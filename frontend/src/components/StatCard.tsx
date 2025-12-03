/**
 * Stat card component for displaying key metrics.
 */

import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  delay?: number;
  highlight?: boolean;
  icon?: ReactNode;
}

export function StatCard({ 
  label, 
  value, 
  suffix = '',
  delay = 0,
  highlight = false,
  icon
}: StatCardProps) {
  return (
    <div 
      className="glass-card-gradient p-5 opacity-0 animate-fade-in-up relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Decorative background icon */}
      {icon && (
        <div className="absolute -right-3 -bottom-3 w-20 h-20 text-accent-500/[0.07] rotate-12 pointer-events-none" aria-hidden="true">
          {icon}
        </div>
      )}
      
      <p className="text-sm text-surface-600 font-medium mb-1 relative">{label}</p>
      <p className={`text-2xl font-semibold font-mono relative ${highlight ? 'gradient-text-hero' : 'text-surface-900'}`}>
        {value}
        {suffix && <span className="text-surface-500 text-lg ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

