import { Hourglass } from 'lucide-react';
import React from 'react'

export default function Loading() {
 return (
        <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-6 text-center">
            <div className="relative">
                <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-xl animate-pulse"></div>
                <div className="relative h-16 w-16 rounded-full border border-purple-400/40 flex items-center justify-center">
                    <Hourglass className="h-8 w-8 text-purple-300 animate-spin-slow" size={32} />
                </div>
            </div>
            <div>
                <p className="text-shadow-md italic tracking-wide text-zinc-300">Time bends inside your dream…</p>
            </div>
        </div>
    );
}
