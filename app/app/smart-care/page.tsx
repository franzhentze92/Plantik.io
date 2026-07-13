"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { smartCareProducts } from "@/data/smart-care";
import { formatQ } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { Mic, MessageCircle } from "lucide-react";

const tankSizes = ["5 L", "10 L", "20 L", "50 L", "100 L", "200 L"];

export default function SmartCarePage() {
  const [showReply, setShowReply] = useState(false);

  useEffect(() => {
    track("page_view", { route: "/app/smart-care" });
  }, []);

  return (
    <div className="container-app py-10">
      <span className="eyebrow">Smart Care</span>
      <h1 className="mt-3 font-serif text-3xl text-brand-forest sm:text-4xl">
        Un ecosistema que cuida tus plantas por ti
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-brand-carbon/65">
        Adapta cualquier maceta, conecta un tanque central, dosifica
        nutrientes automáticamente y controla todo desde Copilot Pot.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {smartCareProducts.map((product) => (
          <div key={product.id} className="card-surface overflow-hidden">
            <div className="relative h-40 w-full">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </div>
            <div className="p-5">
              <h2 className="font-serif text-xl text-brand-forest">
                {product.name}
              </h2>
              <p className="mt-1 text-xs text-brand-carbon/60">
                {product.description}
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-1.5">
                {product.features.map((f) => (
                  <li key={f} className="text-[11px] text-brand-carbon/65">
                    · {f}
                  </li>
                ))}
              </ul>
              {product.id === "tank-hub" && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tankSizes.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-brand-sage px-2 py-1 text-[10px] font-medium text-brand-forest"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-4 text-sm font-semibold text-brand-forest">
                {formatQ(product.priceQ)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-surface mt-10 p-6">
        <h2 className="font-serif text-2xl text-brand-forest">
          Copilot Pot en acción
        </h2>
        <p className="mt-1 text-xs text-brand-carbon/60">
          Una demostración simulada de la conversación con voz y chat.
        </p>

        <div className="mt-5 space-y-3">
          <div className="ml-auto max-w-sm rounded-2xl rounded-tr-sm bg-brand-sage px-4 py-2.5 text-sm text-brand-carbon">
            ¿Cómo están mis plantas?
          </div>

          {!showReply ? (
            <button
              onClick={() => setShowReply(true)}
              className="inline-flex items-center gap-2 rounded-full border border-brand-beige bg-white px-4 py-2 text-xs font-medium text-brand-forest"
            >
              <Mic className="h-3.5 w-3.5" />
              Escuchar respuesta de Copilot
            </button>
          ) : (
            <div className="mr-auto flex max-w-sm items-start gap-2 rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-sm text-brand-carbon shadow-soft">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest" />
              Nueve están bien. La monstera de la sala necesita agua en las
              próximas horas y el pothos del pasillo está recibiendo poca luz.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
