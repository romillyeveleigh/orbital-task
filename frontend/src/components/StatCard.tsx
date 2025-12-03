/**
 * Stat card component for displaying key metrics.
 */

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  delay?: number;
  highlight?: boolean;
}

export function StatCard({ 
  label, 
  value, 
  suffix = '',
  delay = 0,
  highlight = false
}: StatCardProps) {
  return (
    <div 
      className="glass-card-gradient p-5 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-sm text-surface-600 font-medium mb-1">{label}</p>
      <p className={`text-2xl font-semibold font-mono ${highlight ? 'gradient-text-hero' : 'text-surface-900'}`}>
        {value}
        {suffix && <span className="text-surface-500 text-lg ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

