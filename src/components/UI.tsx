import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Card = ({ children, className, title, subtitle }: { children: React.ReactNode; className?: string; title?: string; subtitle?: string }) => (
  <div className={cn("premium-card rounded-[28px] p-6 h-full transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--glass-highlight)]", className)}>
    {(title || subtitle) && (
      <div className="mb-6">
        {title && <h3 className="text-[var(--foreground)] font-black text-lg tracking-tight">{title}</h3>}
        {subtitle && <p className="text-[var(--muted)] text-sm mt-1">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

export const Button = ({ children, className, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }) => {
  const variants = {
    primary: "bg-[var(--primary)] text-[var(--primary-foreground)]",
    secondary: "bg-[var(--glass-bg)] hover:bg-[var(--glass-highlight)] text-[var(--foreground)] border border-[var(--glass-border)]",
    outline: "bg-transparent border border-[var(--border)] hover:bg-[var(--accent)] text-[var(--foreground)]",
    ghost: "bg-transparent hover:bg-[var(--accent)] text-[var(--muted)]"
  };

  return (
    <button 
      className={cn(
        "premium-button px-4 py-2 font-black disabled:opacity-50 flex items-center justify-center gap-2 backdrop-blur-xl",
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
      "w-full bg-[var(--input)] border border-[var(--border)] rounded-full px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)]/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/25 focus:border-[var(--glass-highlight)] transition-all",
      className
    )}
    {...props}
  />
);

export const Badge = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span 
    className={cn("px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase inline-flex items-center justify-center bg-[var(--accent)] text-[var(--foreground)] border border-[var(--border)]", className)}
    {...props}
  >
    {children}
  </span>
);
