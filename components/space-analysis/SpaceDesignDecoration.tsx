import Image from "next/image";
import { Leaf } from "lucide-react";

export function SpaceDesignDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft ambient glow */}
      <div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-brand-moss/20 blur-3xl" />
      <div className="absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-brand-sage/40 blur-3xl" />

      {/* Botanical leaves — bottom left */}
      <div className="absolute -bottom-4 -left-4 hidden h-40 w-56 opacity-80 sm:block lg:h-48 lg:w-64">
        <Image
          src="https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80"
          alt=""
          aria-hidden
          fill
          className="object-cover object-right mask-image-fade"
          style={{
            maskImage: "linear-gradient(to top right, black 40%, transparent 85%)",
            WebkitMaskImage:
              "linear-gradient(to top right, black 40%, transparent 85%)",
          }}
        />
      </div>

      {/* Wireframe living room — right */}
      <div className="absolute right-0 top-1/2 hidden w-[42%] max-w-md -translate-y-1/2 lg:block">
        <svg
          viewBox="0 0 400 280"
          className="h-auto w-full text-brand-forest/20"
          fill="none"
        >
          <rect
            x="40"
            y="60"
            width="320"
            height="200"
            rx="8"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <path
            d="M80 200 L80 120 L160 120 L160 200 Z"
            stroke="currentColor"
            strokeWidth="1"
            fill="rgba(31, 94, 59, 0.04)"
          />
          <circle cx="280" cy="100" r="24" stroke="currentColor" strokeWidth="1" />
          <path
            d="M268 200 L268 150 Q280 130 292 150 L292 200"
            stroke="currentColor"
            strokeWidth="1"
            fill="rgba(31, 94, 59, 0.06)"
          />
          <line x1="40" y1="200" x2="360" y2="200" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="140" r="3" fill="currentColor" className="animate-pulse2" />
          <circle cx="240" cy="160" r="2" fill="currentColor" opacity="0.6" />
        </svg>
        <div className="absolute right-16 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-brand-forest/15 bg-white/60 shadow-card backdrop-blur">
          <Leaf className="h-6 w-6 text-brand-forest" />
        </div>
      </div>
    </div>
  );
}
