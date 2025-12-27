import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  // Add 'type' here to fix the TypeScript error
  variant?: 'default' | 'outline' | 'status' | 'type'; 
  className?: string;
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  const variants = {
    default: "bg-neutral-800 text-neutral-300",
    outline: "border border-neutral-800 text-neutral-500",
    // Define the style for the 'type' variant
    type: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    status: "bg-white text-black font-black uppercase tracking-tighter"
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center justify-center", 
      variants[variant], 
      className
    )}>
      {children}
    </span>
  );
};