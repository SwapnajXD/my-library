import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const Button = ({ variant = 'primary', icon: Icon, children, className, ...props }: ButtonProps) => {
  const variants = {
    primary: "bg-white text-black hover:bg-neutral-200",
    secondary: "bg-neutral-900 text-white border border-neutral-800 hover:bg-neutral-800",
    ghost: "bg-transparent text-neutral-400 hover:text-white hover:bg-white/5"
  };

  return (
    <button 
      className={cn(
        "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
};