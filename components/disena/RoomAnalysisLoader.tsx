"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { ANALYSIS_PHASES } from "@/lib/ai-simulator";

export function RoomAnalysisLoader({ onDone }: { onDone: () => void }) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const stepMs = 550;
    const timers = ANALYSIS_PHASES.map((_, i) =>
      setTimeout(() => setPhaseIndex(i), i * stepMs)
    );
    const done = setTimeout(onDone, ANALYSIS_PHASES.length * stepMs + 300);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <span className="flex h-16 w-16 animate-pulse2 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
        <Sparkles className="h-7 w-7" />
      </span>
      <div className="space-y-2">
        {ANALYSIS_PHASES.map((phase, i) => (
          <p
            key={phase}
            className={`text-sm transition-colors ${
              i === phaseIndex
                ? "font-semibold text-brand-forest"
                : i < phaseIndex
                ? "text-brand-carbon/40 line-through"
                : "text-brand-carbon/30"
            }`}
          >
            {phase}…
          </p>
        ))}
      </div>
    </div>
  );
}
