
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom';

interface Props {
    img: string | undefined;
    title: string;
    onClose?: () => void;
}

export default function ImageFull({ img, title, onClose }: Props) {
  const [mounted, SetMounted] = useState(false)

  useEffect(()=>{
    SetMounted(true)
    if(img){
      document.body.style.overflow = 'hidden'
    }
    return()=>{
      document.body.style.overflow = 'unset'      
    };
  },[img]);
  if(!mounted || !img) return null

  return createPortal(
    <div className="absolute inset-0 z-100 flex items-center justify-center animate-fade-in">

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Conteúdo */}
      <div className="relative z-100 flex flex-col items-center gap-4 px-6">

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
          className="pointer-events-auto absolute bottom-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3 text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        >
          Close View
        </button>
      </div>
    </div>
  , document.body);
}
