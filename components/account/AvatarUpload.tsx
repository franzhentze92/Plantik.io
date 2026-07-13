"use client";

import { Camera } from "lucide-react";
import { getProfileInitials } from "@/lib/store";

const MAX_AVATAR_BYTES = 180_000;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No canvas"));
          return;
        }
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        let quality = 0.85;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > MAX_AVATAR_BYTES && quality > 0.4) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AvatarUpload({
  name,
  avatarUrl,
  onChange,
}: {
  name: string;
  avatarUrl: string | null;
  onChange: (url: string | null) => void;
}) {
  const initials = getProfileInitials(name);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch (err) {
      console.error("Error processing avatar:", err);
    }
  }

  return (
    <div className="relative">
      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand-forest text-2xl font-semibold text-white shadow-card">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <label
        htmlFor="avatar-upload"
        className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-brand-forest text-white shadow-soft transition-transform hover:scale-105"
        title="Cambiar foto"
      >
        <Camera className="h-3.5 w-3.5" />
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFile}
        />
      </label>
      {avatarUrl && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-2 text-[11px] font-medium text-brand-carbon/50 hover:text-red-500"
        >
          Quitar foto
        </button>
      )}
    </div>
  );
}
