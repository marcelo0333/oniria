import { motion } from 'framer-motion';
import { label } from 'framer-motion/client';
import React from 'react'

interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
}

export function Slider({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
}: SliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;
    const intensityLabel = value < 4 ? 'Calm 🌙' : value < 8 ? 'Vivid ✨' : 'Chaotic 🔥';

   return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm text-zinc-400">
          {label}: <span className="text-purple-400">{value} ({intensityLabel})</span>
        </label>
      )}

      <div
        className="relative h-2 w-full rounded-full bg-zinc-700 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const newValue = Math.round((x / rect.width) * (max - min) + min);
          onChange(newValue);
        }}
      >
        {/* Filled track */}
        <motion.div
          className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb */}
        <motion.div
          className="
            absolute top-1/2
            h-5 w-5
            -translate-y-1/2
            rounded-full
            bg-white
            shadow-lg
            cursor-grab
          "
          style={{ left: `calc(${percentage}% - 10px)` }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 1.4 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          onDrag={(e, info) => {
            const parent = (e.target as HTMLElement).parentElement!;
            const rect = parent.getBoundingClientRect();
            const x = info.point.x - rect.left;
            const newValue = Math.round((x / rect.width) * (max - min) + min);
            onChange(Math.min(max, Math.max(min, newValue)));
          }}
        />
      </div>
    </div>
  );
}