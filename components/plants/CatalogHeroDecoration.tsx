import Image from "next/image";
import { Leaf } from "lucide-react";

export function CatalogHeroDecoration() {
  return (
    <div className="pointer-events-none absolute right-0 top-1/2 hidden h-52 w-[44%] max-w-lg -translate-y-1/2 overflow-hidden rounded-xl2 lg:block">
      <Image
        src="https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=900&q=80"
        alt=""
        aria-hidden
        fill
        className="object-cover"
      />

      {/* Fade the artwork into the page background from the left. */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-cream via-brand-cream/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-cream/50 to-transparent" />

      {/* Tech / circuit flourish evoking the Smart Care aesthetic. */}
      <svg
        className="absolute inset-0 h-full w-full text-brand-forest/25"
        viewBox="0 0 400 220"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="300" cy="110" r="70" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" />
        <circle cx="300" cy="110" r="48" stroke="currentColor" strokeWidth="1" strokeDasharray="2 5" />
        <path d="M120 110 H230" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
        <path d="M300 40 V62" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
        <path d="M300 158 V182" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="120" cy="110" r="2.5" fill="currentColor" />
        <circle cx="300" cy="40" r="2.5" fill="currentColor" />
        <circle cx="300" cy="182" r="2.5" fill="currentColor" />
      </svg>

      {/* Glowing leaf emblem. */}
      <div className="absolute right-16 top-1/2 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-brand-forest/20 bg-white/70 shadow-card backdrop-blur">
        <Leaf className="h-7 w-7 text-brand-forest" />
      </div>
    </div>
  );
}
