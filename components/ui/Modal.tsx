"use client";

import { AnimatePresence, motion } from 'framer-motion';
import React from 'react'

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
        {open && (
            <>
                <motion.div
                    className='fixed inset-0 z-40 bg-indigo-900/40 backdrop-blur-sm'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                />

                <motion.div className='fixed inset-0 z-50 flex items-center justify-center pointer-events-none'
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    <div
                    className="pointer-events-auto w-full max-w-md rounded-2xl
                                bg-white/80 dark:bg-zinc-900/80
                                relative
                                backdrop-blur-sm
                                shadow-xl
                                p-6
                                max-h-[80vh]
                                overflow-y-auto
                                scroll-smooth
                                scrollbar-thin
                                scrollbar-thumb-zinc-500/30
                                scrollbar-track-transparent"
                    onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
  );
}
