"use client";

import Image from "next/image";

interface SpaceAnalyzingPreviewProps {
  imageUrl: string;
}

function ScanCorners() {
  const base = "absolute h-5 w-5 border-white/85";
  return (
    <div className="pointer-events-none absolute inset-3 sm:inset-4">
      <span className={`${base} left-0 top-0 rounded-tl-md border-l-2 border-t-2`} />
      <span className={`${base} right-0 top-0 rounded-tr-md border-r-2 border-t-2`} />
      <span className={`${base} bottom-0 left-0 rounded-bl-md border-b-2 border-l-2`} />
      <span className={`${base} bottom-0 right-0 rounded-br-md border-b-2 border-r-2`} />
    </div>
  );
}

function Reticle({ top, left }: { top: string; left: string }) {
  return (
    <div className="pointer-events-none absolute" style={{ top, left }}>
      <span className="absolute -inset-3 rounded-full border border-brand-terracotta/70 animate-ping-ring" />
      <span className="relative block h-3 w-3 animate-reticle rounded-full bg-brand-terracotta ring-4 ring-white/70" />
    </div>
  );
}

export function SpaceAnalyzingPreview({ imageUrl }: SpaceAnalyzingPreviewProps) {
  return (
    <div className="relative pb-5">
      <div className="relative overflow-hidden rounded-xl2 border border-brand-beige bg-brand-cream shadow-soft">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
          <Image
            src={imageUrl}
            alt="Tu espacio"
            fill
            className="object-cover"
            unoptimized
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-forest/15 via-transparent to-brand-forest/5" />

          <div className="pointer-events-none absolute inset-x-0 animate-scan-line">
            <div className="h-14 w-full bg-gradient-to-b from-brand-terracotta/25 to-transparent" />
            <div className="h-px w-full bg-brand-terracotta shadow-[0_0_10px_1px_rgba(183,110,77,0.7)]" />
          </div>

          <ScanCorners />
          <Reticle top="36%" left="42%" />
          <Reticle top="58%" left="62%" />
          <Reticle top="72%" left="28%" />
        </div>
      </div>

      <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-brand-beige bg-white px-4 py-2 text-xs font-semibold text-brand-forest shadow-card">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping-ring rounded-full bg-brand-forest/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-forest" />
        </span>
        Analizando tu espacio
      </div>
    </div>
  );
}
