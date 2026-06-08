import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Card = ({ children, className, title, subtitle }: { children: React.ReactNode; className?: string; title?: string; subtitle?: string }) => (
  <div className={cn("glass-panel rounded-[28px] p-6 h-full transition-all hover:border-white/20", className)}>
    {(title || subtitle) && (
      <div className="mb-6">
        {title && <h3 className="text-(--foreground) font-bold text-lg">{title}</h3>}
        {subtitle && <p className="text-(--muted) text-sm">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

export const Button = ({ children, className, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }) => {
  const variants = {
    primary: "bg-(--primary) hover:bg-white/90 text-(--primary-foreground) shadow-[var(--shadow-soft)]",
    secondary: "bg-(--glass-bg) hover:bg-(--glass-highlight) text-(--foreground) border border-(--glass-border)",
    outline: "bg-transparent border border-(--border) hover:bg-(--accent) text-(--foreground) shadow-sm",
    ghost: "bg-transparent hover:bg-(--accent) text-(--muted)"
  };

  return (
    <button 
      className={cn(
        "px-4 py-2 rounded-full font-medium transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 backdrop-blur-xl", 
        variants[variant], 
        className
      )} 
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className={cn(
      "w-full bg-(--input) border border-(--border) rounded-full px-4 py-3 text-(--foreground) placeholder:text-(--muted)/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-(--ring)/25 focus:border-(--glass-highlight) transition-all",
      className
    )}
    {...props}
  />
);

export const Badge = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span 
    className={cn("px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase inline-flex items-center justify-center bg-(--accent) text-(--foreground) border border-(--border)", className)}
    {...props}
  >
    {children}
  </span>
);
