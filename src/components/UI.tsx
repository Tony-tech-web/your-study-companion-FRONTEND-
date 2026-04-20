import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Card = ({ children, className, title, subtitle }: { children: React.ReactNode; className?: string; title?: string; subtitle?: string }) => (
  <div className={cn("bg-(--card) border border-(--border) rounded-2xl p-6 h-full shadow-sm hover:shadow-md transition-all", className)}>
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
    primary: "bg-(--primary) hover:bg-(--primary)/90 text-white shadow-sm",
    secondary: "bg-(--secondary) hover:bg-(--secondary)/80 text-(--foreground)",
    outline: "bg-transparent border border-(--border) hover:bg-(--accent) text-(--foreground) shadow-sm",
    ghost: "bg-transparent hover:bg-(--accent) text-(--muted)"
  };

  return (
    <button 
      className={cn(
        "px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2", 
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
      "w-full bg-(--input) border border-(--border) rounded-xl px-4 py-2 text-(--foreground) placeholder:text-(--muted)/50 focus:outline-none focus:ring-2 focus:ring-(--primary)/20 focus:border-(--primary) transition-all",
      className
    )}
    {...props}
  />
);

export const Badge = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span 
    className={cn("px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase inline-flex items-center justify-center bg-(--accent) text-(--primary)", className)}
    {...props}
  >
    {children}
  </span>
);
