import { IconProps } from './types';

export function OrbitalIcon({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="8" strokeDasharray="4 2" />
    </svg>
  );
}

