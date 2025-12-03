import { IconProps } from './types';

export function ReportIcon({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-3-7v5h-2v-3H9v-2h4V9l3 4z"/>
    </svg>
  );
}

