import { IconProps } from './types';

export function TrendIcon({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
    </svg>
  );
}

