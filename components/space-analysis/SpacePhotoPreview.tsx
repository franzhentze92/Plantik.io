"use client";

import Image from "next/image";
import { Camera, Check, Leaf } from "lucide-react";

interface SpacePhotoPreviewProps {
  imageUrl: string;
  onChangePhoto: () => void;
}

export function SpacePhotoPreview({
  imageUrl,
  onChangePhoto,
}: SpacePhotoPreviewProps) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-brand-beige/60 px-4 py-3 sm:px-5">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-sage px-3 py-1 text-xs font-semibold text-brand-forest">
          <Check className="h-3.5 w-3.5" />
          Foto cargada
        </span>
        <button
          type="button"
          onClick={onChangePhoto}
          className="inline-flex items-center gap-2 rounded-full border border-brand-beige bg-white px-3 py-1.5 text-xs font-semibold text-brand-forest transition-colors hover:bg-brand-sage/60"
        >
          <Camera className="h-3.5 w-3.5" />
          Cambiar foto
        </button>
      </div>

      <div className="relative aspect-[4/3] w-full bg-brand-cream">
        <Image
          src={imageUrl}
          alt="Tu espacio"
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="border-t border-brand-beige/60 bg-brand-sage/40 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-forest shadow-soft">
            <Leaf className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-brand-forest">
              Consejo Plantik
            </p>
            <p className="mt-1 text-xs leading-relaxed text-brand-carbon/65">
              Una buena iluminación y el tipo de espacio son clave para el
              bienestar de tus plantas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
