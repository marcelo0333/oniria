
import React from 'react'

interface Props {
    img: string | undefined;
    title: string;
    onClose?: () => void;
}

export default function ImageFull({ img, title, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6">

        {title && (
          <h3 className="text-xl font-[var(--font-playfair)] text-zinc-200 tracking-wide">
            {title}
          </h3>
        )}

        <img
          src={img}
          alt={title || "Dream Scene"}
          className="max-h-[80vh] rounded-2xl shadow-2xl object-contain"
        />
        <button
          onClick={onClose}
          className="mt-4 rounded-full bg-purple-600/80 px-4 py-2 text-zinc-100 hover:bg-purple-600/100 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
