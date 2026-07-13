"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function ConfirmationModal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-carbon/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-md rounded-xl2 bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="font-serif text-xl text-brand-forest">
            {title}
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-1 text-brand-carbon/50 hover:bg-brand-sage hover:text-brand-forest"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-brand-carbon/70">{description}</p>
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  );
}
