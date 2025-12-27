"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  total: number;
  className?: string;
  showGlow?: boolean; // Add this line
}

export const ProgressBar = ({ 
  progress, 
  total, 
  className, 
  showGlow = false 
}: ProgressBarProps) => {
  const percentage = total > 0 ? Math.min((progress / total) * 100, 100) : 0;

  return (
    <div className={cn("w-full bg-neutral-900 overflow-hidden", className)}>
      <div
        className={cn(
          "h-full bg-white transition-all duration-700 ease-out",
          showGlow && "shadow-[0_0_8px_rgba(255,255,255,0.5)]"
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};