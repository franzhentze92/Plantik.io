"use client";

import Image from "next/image";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CreationPiece {
  label: string;
  image?: string | null;
}

interface CreationThumbnailProps {
  pieces: CreationPiece[];
  name?: string;
  showName?: boolean;
  showChips?: boolean;
  className?: string;
  heroPadding?: string;
  /** Used when no piece has an image (e.g. older creations). Shown contained,
   * never cropped. */
  fallbackImage?: string | null;
}

// Preferred order for choosing the "hero" (largest, centered) piece so the
// composition always leads with the plant, then the planter, etc.
const HERO_PRIORITY = ["Planta", "Maceta", "Plato", "Tierra", "Mulch"];

function pickHero(pieces: CreationPiece[]): CreationPiece | undefined {
  const withImage = pieces.filter((p) => p.image);
  for (const label of HERO_PRIORITY) {
    const match = withImage.find((p) => p.label === label);
    if (match) return match;
  }
  return withImage[0];
}

export function CreationThumbnail({
  pieces,
  name,
  showName = false,
  showChips = true,
  className,
  heroPadding = "p-6",
  fallbackImage,
}: CreationThumbnailProps) {
  const heroPiece = pickHero(pieces);
  const heroSrc = heroPiece?.image || fallbackImage || null;
  const chips = pieces.filter((p) => p.image && p !== heroPiece);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-white",
        className
      )}
    >
      {heroSrc ? (
        <div className={cn("relative h-full w-full", heroPadding)}>
          <Image
            src={heroSrc}
            alt={name || "Creación"}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-brand-forest/60">
          <Sprout className="h-10 w-10" />
          <span className="text-xs font-medium">Tu creación</span>
        </div>
      )}

      {/* Piece chips — show the other components without cropping */}
      {showChips && chips.length > 0 && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {chips.map((piece, idx) => (
            <span
              key={`${piece.label}-${idx}`}
              title={piece.label}
              className="relative h-9 w-9 overflow-hidden rounded-full border border-brand-beige bg-white shadow-sm"
            >
              <Image
                src={piece.image!}
                alt={piece.label}
                fill
                sizes="36px"
                className="object-contain p-1"
              />
            </span>
          ))}
        </div>
      )}

      {showName && name && (
        <span className="absolute bottom-3 left-4 right-24 truncate font-serif text-lg text-brand-forest drop-shadow-sm">
          {name}
        </span>
      )}
    </div>
  );
}

// Helper to derive thumbnail pieces from a stored creation's components.
export function piecesFromComponents(
  components: { label: string; image?: string }[]
): CreationPiece[] {
  return components.map((c) => ({ label: c.label, image: c.image }));
}
