"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";

type ModalProps = { open: boolean; onClose: () => void; children: ReactNode; label?: string; wide?: boolean };

export function Modal({ open, onClose, children, label, wide = false }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className={`pointer-events-auto relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/95 p-6 shadow-2xl ${wide ? "max-w-3xl" : "max-w-md"}`} onClick={(e) => e.stopPropagation()}>
              <button onClick={onClose} aria-label="Fechar" className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-zinc-400 hover:bg-white/10 hover:text-white">✕</button>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
