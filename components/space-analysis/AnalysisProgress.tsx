"use client";

import { Check, Loader2 } from "lucide-react";

interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "in-progress" | "completed";
}

interface AnalysisProgressProps {
  steps: ProgressStep[];
}

export function AnalysisProgress({ steps }: AnalysisProgressProps) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {step.status === "completed" && (
              <Check className="h-5 w-5 text-green-600" />
            )}
            {step.status === "in-progress" && (
              <Loader2 className="h-5 w-5 text-brand-forest animate-spin" />
            )}
            {step.status === "pending" && (
              <div className="h-5 w-5 rounded-full border-2 border-brand-beige" />
            )}
          </div>
          <p
            className={`text-sm font-medium ${
              step.status === "completed"
                ? "text-green-600"
                : step.status === "in-progress"
                  ? "text-brand-forest"
                  : "text-brand-carbon/50"
            }`}
          >
            {step.label}
          </p>
        </div>
      ))}
    </div>
  );
}
