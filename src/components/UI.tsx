import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Card = ({ children, className, title, subtitle }: { children: React.ReactNode; className?: string; title?: string; subtitle?: string }) => (
  <div className={cn("bg-white border border-slate-200 rounded-2xl p-6 h-full shadow-sm hover:shadow-md transition-shadow", className)}>
    {(title || subtitle) && (
      <div className="mb-6">
        {title && <h3 className="text-slate-800 font-bold text-lg">{title}</h3>}
        {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

export const Button = ({ children, className, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    outline: "bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-500"
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
      "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all",
      className
    )}
    {...props}
  />
);

export const Badge = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span 
    className={cn("px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase inline-flex items-center justify-center bg-slate-100 text-slate-600", className)}
    {...props}
  >
    {children}
  </span>
);
