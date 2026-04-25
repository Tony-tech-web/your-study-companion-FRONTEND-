'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

type DialogType = 'confirm' | 'alert' | 'success' | 'error';

interface DialogOptions {
  title?: string;
  message: string;
  type?: DialogType;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface DialogState extends DialogOptions {
  resolve: (value: boolean) => void;
}

const DialogContext = createContext<{ show: (opts: DialogOptions) => Promise<boolean> }>({ show: async () => false });
export const useDialog = () => useContext(DialogContext);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const show = useCallback((opts: DialogOptions): Promise<boolean> =>
    new Promise(resolve => setDialog({ ...opts, resolve })), []);

  const confirm = () => { dialog?.resolve(true); setDialog(null); };
  const cancel = () => { dialog?.resolve(false); setDialog(null); };

  const type = dialog?.type || 'confirm';
  const isDestructive = dialog?.destructive ?? type === 'error';
  const isConfirm = type === 'confirm';

  return (
    <DialogContext.Provider value={{ show }}>
      {children}
      <AnimatePresence>
        {dialog && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={isConfirm ? cancel : confirm} />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="relative w-full max-w-xs bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/20">

              {/* Icon section */}
              <div className="px-6 pt-7 pb-5 flex flex-col items-center text-center">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-4',
                  isDestructive ? 'bg-red-50 dark:bg-red-500/10' :
                  type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10' :
                  'bg-zinc-100 dark:bg-white/5')}>
                  {isDestructive
                    ? <Trash2 className="w-7 h-7 text-red-500" />
                    : type === 'success' ? <CheckCircle className="w-7 h-7 text-emerald-500" />
                    : type === 'error' ? <AlertTriangle className="w-7 h-7 text-red-500" />
                    : <Info className="w-7 h-7 text-blue-500" />}
                </div>
                <h2 className="text-[16px] font-black text-zinc-900 dark:text-white mb-1.5">
                  {dialog.title || (isDestructive ? 'Delete?' : type === 'success' ? 'Success' : 'Confirm')}
                </h2>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{dialog.message}</p>
              </div>

              {/* Buttons */}
              <div className="px-4 pb-5 flex flex-col gap-2">
                <button onClick={confirm}
                  className={cn('w-full py-3 rounded-xl text-[14px] font-bold text-white btn-spring',
                    isDestructive ? 'bg-red-500 shadow-lg shadow-red-500/20' :
                    type === 'success' ? 'bg-emerald-500' : 'shadow-lg shadow-orange-500/20')}
                  style={!isDestructive && type !== 'success' ? { backgroundColor: '#f27d26' } : {}}>
                  {dialog.confirmLabel || (isDestructive ? 'Delete' : isConfirm ? 'Confirm' : 'OK')}
                </button>
                {isConfirm && (
                  <button onClick={cancel}
                    className="w-full py-3 rounded-xl text-[14px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 btn-spring">
                    {dialog.cancelLabel || 'Cancel'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  );
};
