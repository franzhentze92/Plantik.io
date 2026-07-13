"use client";

import { useState, useRef } from "react";
import { AlertCircle, Leaf, Upload } from "lucide-react";

interface SpaceUploadProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
}

export function SpaceUpload({ onImageSelect, isLoading }: SpaceUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = ["image/jpeg", "image/png", "image/webp"];
  const maxSizeMB = 10;

  function validateFile(file: File): string | null {
    if (!acceptedFormats.includes(file.type)) {
      return "Solo se aceptan JPG, PNG o WebP";
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Máximo ${maxSizeMB}MB`;
    }
    return null;
  }

  function handleFiles(files: FileList) {
    if (!files.length) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onImageSelect(file);
  }

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl2 border border-brand-beige/60 bg-white p-3 shadow-card transition-shadow ${
          isDragging ? "shadow-[0_0_32px_rgba(31,94,59,0.12)]" : ""
        } ${isLoading ? "opacity-50" : ""}`}
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`rounded-xl2 border-2 border-dashed px-6 py-8 text-center transition-colors sm:py-10 ${
            isDragging
              ? "border-brand-forest bg-brand-sage/40"
              : "border-brand-beige bg-brand-cream/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFiles(e.currentTarget.files!)}
            className="hidden"
            disabled={isLoading}
          />

          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
            <Upload className="h-5 w-5" />
          </span>

          <h3 className="mt-3 font-semibold text-brand-forest">Sube una foto</h3>
          <p className="mt-1 text-sm text-brand-carbon/60">
            Arrastra y suelta o haz click para seleccionar
          </p>
          <p className="mt-1 text-xs text-brand-carbon/45">
            JPG, PNG o WebP · Máximo {maxSizeMB}MB
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            Seleccionar imagen
            <Leaf className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
