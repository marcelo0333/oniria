import { UserIcon } from 'lucide-react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteSession } from '@/lib/session';

interface UserComponentProps {
  user?: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
}

export default function UserComponent({ user }: UserComponentProps) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    const handleLogout = () => {
        deleteSession();
    };

    // Fecha ao clicar fora
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    // Fecha com ESC
    React.useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
        if (e.key === 'Escape') setOpen(false);
        }

        if (open) {
            window.addEventListener('keydown', handleEsc);
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative">
        {/* Trigger */}
        <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full text-zinc-300 hover:bg-black/80 transition"
        >
            <span className="text-sm">{user?.name || 'Guest'}</span>
            <UserIcon className="h-5 w-5" />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
            {open && (
            <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="
                absolute right-0 mt-2 w-72
                rounded-xl
                bg-white dark:bg-gray-800/95
                shadow-xl
                border border-black/5 dark:border-white/10
                z-50
                "
            >
                <div className="p-4 text-sm text-gray-800 dark:text-gray-200">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                <p className="text-xs mt-1 break-all text-gray-400">{user?.id}</p>
                </div>

                <div className="border-t border-gray-200 dark:border-white/10" />

                <div className="p-3 flex gap-2">
                <button
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-md px-2 py-1 text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
                >
                    Close
                </button>

                <button
                    onClick={handleLogout}
                    className="flex-1 rounded-md px-2 py-1 text-sm bg-red-600 text-white hover:bg-red-700 transition"
                >
                    Logout
                </button>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
        </div>
    );
}


