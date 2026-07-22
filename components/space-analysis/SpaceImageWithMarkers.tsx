"use client";

import { PlacementLocation } from "@/types/space-analysis";
import Image from "next/image";
import { useRef, useState } from "react";
import { MapPin, Plus, X } from "lucide-react";

interface SpaceImageWithMarkersProps {
  imageUrl: string;
  placements: PlacementLocation[];
  onPlacementSelect?: (placement: PlacementLocation) => void;
  selectedPlacementId?: string;
  addMode?: boolean;
  onToggleAddMode?: () => void;
  onAddPlacement?: (x: number, y: number) => void;
  onMovePlacement?: (id: string, x: number, y: number) => void;
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));

/** object-contain content rect inside the box (percent of box size). */
function containedRectPct(
  boxW: number,
  boxH: number,
  naturalW: number,
  naturalH: number
) {
  if (boxW <= 0 || boxH <= 0 || naturalW <= 0 || naturalH <= 0) {
    return { left: 0, top: 0, width: 100, height: 100 };
  }
  const boxAspect = boxW / boxH;
  const imgAspect = naturalW / naturalH;
  if (imgAspect > boxAspect) {
    // Letterbox top/bottom
    const height = (boxAspect / imgAspect) * 100;
    return { left: 0, top: (100 - height) / 2, width: 100, height };
  }
  // Letterbox left/right
  const width = (imgAspect / boxAspect) * 100;
  return { left: (100 - width) / 2, top: 0, width, height: 100 };
}

export function SpaceImageWithMarkers({
  imageUrl,
  placements,
  onPlacementSelect,
  selectedPlacementId,
  addMode = false,
  onToggleAddMode,
  onAddPlacement,
  onMovePlacement,
}: SpaceImageWithMarkersProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const dragRef = useRef<{
    id: string;
    moved: boolean;
    draggable: boolean;
  } | null>(null);

  const aspectRatio = naturalSize ? naturalSize.w / naturalSize.h : null;

  function contentPct() {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect || !naturalSize) {
      return { left: 0, top: 0, width: 100, height: 100 };
    }
    return containedRectPct(rect.width, rect.height, naturalSize.w, naturalSize.h);
  }

  function coordsFromEvent(clientX: number, clientY: number) {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    const c = contentPct();
    const xInBox = ((clientX - rect.left) / rect.width) * 100;
    const yInBox = ((clientY - rect.top) / rect.height) * 100;
    // Map from box % → image content %
    const x = ((xInBox - c.left) / c.width) * 100;
    const y = ((yInBox - c.top) / c.height) * 100;
    return { x: clamp(x), y: clamp(y) };
  }

  function markerStyle(placement: PlacementLocation) {
    const c = contentPct();
    // Image % → box %
    const left = c.left + (placement.x / 100) * c.width;
    const top = c.top + (placement.y / 100) * c.height;
    return { left: `${left}%`, top: `${top}%` };
  }

  function handleBoxClick(e: React.MouseEvent) {
    if (!addMode || !onAddPlacement) return;
    const c = coordsFromEvent(e.clientX, e.clientY);
    if (c) onAddPlacement(c.x, c.y);
  }

  function handleMarkerPointerDown(
    e: React.PointerEvent,
    placement: PlacementLocation
  ) {
    if (addMode) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      id: placement.id,
      moved: false,
      draggable: true,
    };
  }

  function handleMarkerPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d || !d.draggable || !onMovePlacement) return;
    const c = coordsFromEvent(e.clientX, e.clientY);
    if (!c) return;
    d.moved = true;
    onMovePlacement(d.id, c.x, c.y);
  }

  function handleMarkerPointerUp(
    e: React.PointerEvent,
    placement: PlacementLocation
  ) {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (!d.moved) onPlacementSelect?.(placement);
  }

  return (
    <div className="flex flex-col gap-3 lg:h-full lg:min-h-0">
      <div className="relative flex items-center justify-center lg:min-h-0 lg:flex-1">
        <div
          ref={boxRef}
          onClick={handleBoxClick}
          className={`relative w-full max-w-full overflow-hidden rounded-2xl bg-brand-cream shadow-soft ${
            addMode ? "cursor-crosshair ring-2 ring-brand-forest" : ""
          }`}
          style={{
            aspectRatio: aspectRatio ? `${aspectRatio}` : "4 / 3",
            maxHeight: "100%",
          }}
        >
          <Image
            src={imageUrl}
            alt="Espacio fotografiado"
            fill
            className="object-contain"
            unoptimized
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                setNaturalSize({
                  w: img.naturalWidth,
                  h: img.naturalHeight,
                });
              }
            }}
          />

          {addMode && (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center p-3">
              <span className="rounded-full bg-brand-forest/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                Toca la foto para colocar una planta
              </span>
            </div>
          )}

          <div className={addMode ? "pointer-events-none" : ""}>
            {placements.map((placement, idx) => {
              const isSelected = selectedPlacementId === placement.id;
              return (
                <button
                  key={placement.id}
                  onPointerDown={(e) => handleMarkerPointerDown(e, placement)}
                  onPointerMove={handleMarkerPointerMove}
                  onPointerUp={(e) => handleMarkerPointerUp(e, placement)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none transition-transform active:cursor-grabbing ${
                    isSelected ? "scale-125" : "hover:scale-110"
                  }`}
                  style={markerStyle(placement)}
                  title={`Punto ${idx + 1} (arrástralo para moverlo)`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-sm font-semibold text-white shadow-lg ${
                      isSelected
                        ? "bg-brand-terracotta"
                        : "bg-brand-terracotta/80"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-brand-carbon/60">
          Ubicaciones:
        </span>
        {placements.map((placement, idx) => (
          <button
            key={placement.id}
            onClick={() => onPlacementSelect?.(placement)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              selectedPlacementId === placement.id
                ? "border-brand-terracotta bg-brand-terracotta text-white"
                : "border-brand-beige bg-white text-brand-carbon hover:border-brand-forest/30"
            }`}
          >
            <MapPin className="h-3 w-3" />
            Punto {idx + 1}
          </button>
        ))}

        {onToggleAddMode && (
          <button
            onClick={onToggleAddMode}
            className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              addMode
                ? "border-brand-forest bg-brand-forest text-white"
                : "border-brand-forest/40 bg-white text-brand-forest hover:bg-brand-sage/60"
            }`}
          >
            {addMode ? (
              <>
                <X className="h-3.5 w-3.5" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Agregar punto
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
