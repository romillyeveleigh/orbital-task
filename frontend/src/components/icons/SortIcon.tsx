import { IconProps } from "./types";
import { cn } from "../../lib";

interface SortIconProps extends IconProps {
  direction: "asc" | "desc" | "none";
}

export function SortIcon({
  direction,
  className = "w-4 h-4",
  ...props
}: SortIconProps) {
  if (direction === "none") {
    return (
      <svg
        className={cn(className, "text-surface-400")}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  }

  return (
    <svg
      className={cn(
        className,
        "text-accent-600",
        direction === "desc" && "rotate-180",
      )}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  );
}
