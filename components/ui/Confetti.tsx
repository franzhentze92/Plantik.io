"use client";

import { useEffect, useMemo, useState } from "react";

const COLORS = ["#2f5d3a", "#7aa874", "#c6dcc0", "#e5b769", "#d98b5f", "#f4ede0"];

type Piece = {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  color: string;
  width: number;
  height: number;
};

/**
 * Lightweight, dependency-free confetti burst. Renders a fixed overlay of
 * falling pieces once and then unmounts itself after `durationMs`.
 */
export function Confetti({
  count = 90,
  durationMs = 3500,
}: {
  count?: number;
  durationMs?: number;
}) {
  const [done, setDone] = useState(false);

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.4 + Math.random() * 1.6,
        drift: (Math.random() - 0.5) * 240,
        spin: 360 + Math.random() * 720,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        width: 6 + Math.random() * 6,
        height: 10 + Math.random() * 8,
      })),
    [count]
  );

  useEffect(() => {
    const timeout = setTimeout(() => setDone(true), durationMs);
    return () => clearTimeout(timeout);
  }, [durationMs]);

  if (done) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--confetti-drift" as string]: `${p.drift}px`,
            ["--confetti-spin" as string]: `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
