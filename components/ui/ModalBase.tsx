"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export const ModalBase = ({ children, onClose, title }: any) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#000000] border border-neutral-900 rounded-4xl overflow-hidden animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors z-50">
          <X size={20} strokeWidth={1.5} />
        </button>
        {title && (
          <div className="px-8 pt-8">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-700">{title}</span>
          </div>
        )}
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};