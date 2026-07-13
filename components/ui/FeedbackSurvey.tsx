"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

const SURVEY_KEY = "verdea_survey_responses";

function saveSurveyResponse(response: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem(SURVEY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push({ ...response, submittedAt: new Date().toISOString() });
    localStorage.setItem(SURVEY_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

const scale = [1, 2, 3, 4, 5];

export function FeedbackSurvey({
  triggerContext,
  onDone,
}: {
  triggerContext: string;
  onDone: () => void;
}) {
  const [usefulness, setUsefulness] = useState<number>();
  const [wouldBuy, setWouldBuy] = useState<string>();
  const [interestedIn, setInterestedIn] = useState<string>();
  const [confusingPart, setConfusingPart] = useState("");
  const [willingToPayQ, setWillingToPayQ] = useState("");
  const [smartCareInterest, setSmartCareInterest] = useState<string>();
  const [copilotInterest, setCopilotInterest] = useState<string>();
  const [preference, setPreference] = useState<string>();
  const [blocker, setBlocker] = useState("");
  const [comments, setComments] = useState("");

  function submit() {
    saveSurveyResponse({
      triggerContext,
      usefulness,
      wouldBuy,
      interestedIn,
      confusingPart,
      willingToPayQ,
      smartCareInterest,
      copilotInterest,
      preference,
      blocker,
      comments,
    });
    track("survey_completed", { payload: { triggerContext } });
    onDone();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-carbon">
          ¿Qué tan útil te pareció la recomendación?
        </p>
        <div className="mt-2 flex gap-2">
          {scale.map((n) => (
            <button
              key={n}
              onClick={() => setUsefulness(n)}
              className={`h-9 w-9 rounded-full text-xs font-semibold ${
                usefulness === n
                  ? "bg-brand-forest text-white"
                  : "bg-brand-sage text-brand-forest"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-brand-carbon">
          ¿Comprarías una planta de esta forma?
        </p>
        <div className="mt-2 flex gap-2">
          {["Sí", "Tal vez", "No"].map((opt) => (
            <button
              key={opt}
              onClick={() => setWouldBuy(opt)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium ${
                wouldBuy === opt
                  ? "border-brand-forest bg-brand-forest text-white"
                  : "border-brand-beige bg-white text-brand-carbon/70"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold text-brand-carbon">
            ¿Cuánto pagarías por esta combinación? (Q)
          </span>
          <input
            value={willingToPayQ}
            onChange={(e) => setWillingToPayQ(e.target.value)}
            inputMode="numeric"
            placeholder="Ej. 300"
            className="mt-2 w-full rounded-lg border border-brand-beige px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-brand-carbon">
            ¿Qué te impide comprar hoy?
          </span>
          <input
            value={blocker}
            onChange={(e) => setBlocker(e.target.value)}
            placeholder="Opcional"
            className="mt-2 w-full rounded-lg border border-brand-beige px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-brand-carbon">
            ¿Agregarías Smart Care?
          </p>
          <div className="mt-2 flex gap-2">
            {["Sí", "No", "Aún no sé"].map((opt) => (
              <button
                key={opt}
                onClick={() => setSmartCareInterest(opt)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  smartCareInterest === opt
                    ? "border-brand-forest bg-brand-forest text-white"
                    : "border-brand-beige bg-white text-brand-carbon/70"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-brand-carbon">
            ¿Pagarías por Copilot Home?
          </p>
          <div className="mt-2 flex gap-2">
            {["Sí", "No", "Aún no sé"].map((opt) => (
              <button
                key={opt}
                onClick={() => setCopilotInterest(opt)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  copilotInterest === opt
                    ? "border-brand-forest bg-brand-forest text-white"
                    : "border-brand-beige bg-white text-brand-carbon/70"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-brand-carbon">
          ¿Preferirías comprar una planta individual o un paquete?
        </p>
        <div className="mt-2 flex gap-2">
          {["Individual", "Paquete", "Ambos"].map((opt) => (
            <button
              key={opt}
              onClick={() => setPreference(opt)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                preference === opt
                  ? "border-brand-forest bg-brand-forest text-white"
                  : "border-brand-beige bg-white text-brand-carbon/70"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm">
        <span className="font-semibold text-brand-carbon">
          ¿Qué parte te interesó más o te resultó confusa?
        </span>
        <textarea
          value={interestedIn}
          onChange={(e) => setInterestedIn(e.target.value)}
          rows={2}
          placeholder="Opcional"
          className="mt-2 w-full rounded-lg border border-brand-beige px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="font-semibold text-brand-carbon">
          Comentarios adicionales
        </span>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={2}
          placeholder="Opcional"
          className="mt-2 w-full rounded-lg border border-brand-beige px-3 py-2 text-sm"
        />
      </label>

      <button
        onClick={submit}
        className="w-full rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white sm:w-auto"
      >
        Enviar respuestas
      </button>
    </div>
  );
}
