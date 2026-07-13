"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, ImageIcon } from "lucide-react";
import { roomExamples } from "@/data/room-examples";
import { cn } from "@/lib/utils";

export function RoomUploader({
  onSelect,
}: {
  onSelect: (photoDataUrl: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const readFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") onSelect(reader.result);
      };
      reader.readAsDataURL(file);
    },
    [onSelect]
  );

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) readFile(file);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl2 border-2 border-dashed px-6 py-14 text-center transition-colors",
          isDragging
            ? "border-brand-forest bg-brand-sage/60"
            : "border-brand-beige bg-white hover:border-brand-moss"
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
          <UploadCloud className="h-6 w-6" />
        </span>
        <p className="text-sm font-medium text-brand-carbon">
          Arrastra una fotografía de tu espacio aquí
        </p>
        <p className="text-xs text-brand-carbon/55">
          o haz clic para seleccionar un archivo — JPG o PNG
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readFile(file);
          }}
        />
      </label>

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-carbon/50">
          <ImageIcon className="h-3.5 w-3.5" />
          O usa una fotografía de demostración
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {roomExamples.map((room) => (
            <button
              key={room.id}
              onClick={() => onSelect(room.image)}
              className="group overflow-hidden rounded-xl2 border border-brand-beige/70 text-left"
            >
              <div className="relative h-24 w-full overflow-hidden">
                <Image
                  src={room.image}
                  alt={room.label}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="px-3 py-2 text-xs font-medium text-brand-carbon/75">
                {room.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
