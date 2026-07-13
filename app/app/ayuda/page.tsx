"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Leaf, MessageCircle, Search, type LucideIcon } from "lucide-react";
import { FAQ_ALL_CATEGORY_ID, FAQ_CATEGORIES, type Faq } from "@/data/faqs";
import { FAQ_ICONS } from "@/lib/faq-icons";
import { track } from "@/lib/analytics";

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<string>(FAQ_ALL_CATEGORY_ID);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    track("page_view", { route: "/app/ayuda" });
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const visibleCategories = useMemo(() => {
    return FAQ_CATEGORIES.map((cat) => {
      const faqs = cat.faqs.filter((faq) => {
        if (!normalizedQuery) return true;
        return (
          faq.q.toLowerCase().includes(normalizedQuery) ||
          faq.a.toLowerCase().includes(normalizedQuery)
        );
      });
      return { ...cat, faqs };
    }).filter((cat) => {
      if (activeCategory !== FAQ_ALL_CATEGORY_ID && cat.id !== activeCategory) {
        return false;
      }
      return cat.faqs.length > 0;
    });
  }, [activeCategory, normalizedQuery]);

  const totalResults = visibleCategories.reduce(
    (sum, cat) => sum + cat.faqs.length,
    0
  );

  return (
    <div className="container-app py-10">
      <div className="relative overflow-hidden rounded-xl2 border border-brand-beige/70 bg-gradient-to-br from-brand-sage/50 via-white to-brand-cream p-8 shadow-soft sm:p-10">
          <Leaf className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rotate-12 text-brand-moss/10" />
          <Leaf className="pointer-events-none absolute -bottom-10 right-24 h-28 w-28 -rotate-12 text-brand-moss/10" />
          <div className="relative flex items-start justify-between gap-6">
            <div>
              <span className="eyebrow">Ayuda</span>
              <h1 className="mt-3 font-serif text-3xl text-brand-forest sm:text-4xl">
                Preguntas frecuentes
              </h1>
              <p className="mt-2 max-w-xl text-sm text-brand-carbon/65">
                Encuentra respuestas rápidas a las dudas más comunes sobre
                Plantik, organizadas por tema.
              </p>
            </div>
            <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/80 text-brand-forest shadow-soft ring-1 ring-brand-beige/60 backdrop-blur sm:flex">
              <MessageCircle className="h-8 w-8" />
            </span>
          </div>

          <div className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-carbon/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca una pregunta..."
              className="w-full rounded-full border border-brand-beige bg-white py-2.5 pl-11 pr-4 text-sm text-brand-carbon placeholder:text-brand-carbon/40 shadow-soft focus:border-brand-forest/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <CategoryPill
            label="Todas"
            icon={FAQ_ICONS.sparkles}
            active={activeCategory === FAQ_ALL_CATEGORY_ID}
            onClick={() => setActiveCategory(FAQ_ALL_CATEGORY_ID)}
          />
          {FAQ_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.id}
              label={cat.label}
              icon={FAQ_ICONS[cat.iconKey]}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>

        {totalResults === 0 ? (
          <div className="mt-10 rounded-xl2 border border-dashed border-brand-beige bg-white/60 p-10 text-center">
            <p className="text-sm text-brand-carbon/60">
              No encontramos preguntas para{" "}
              <span className="font-semibold text-brand-forest">“{query}”</span>.
              Prueba con otras palabras o revisa otra categoría.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {visibleCategories.map((cat) => {
              const CategoryIcon = FAQ_ICONS[cat.iconKey];
              return (
                <section key={cat.id}>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-sage text-brand-forest">
                      <CategoryIcon className="h-4 w-4" />
                    </span>
                    <h2 className="font-serif text-xl text-brand-forest">
                      {cat.label}
                    </h2>
                  </div>

                  <div className="relative mt-5 pl-6">
                    <span className="absolute bottom-2 left-[7px] top-2 w-px bg-brand-beige" />
                    <div className="space-y-3">
                      {cat.faqs.map((faq) => {
                        const key = `${cat.id}-${faq.q}`;
                        const isOpen = open === key;
                        return (
                          <div key={key} className="relative">
                            <span
                              className={`absolute -left-[22px] top-6 h-2.5 w-2.5 rounded-full ring-4 ring-brand-cream transition-colors ${
                                isOpen ? "bg-brand-forest" : "bg-brand-moss/40"
                              }`}
                            />
                            <FaqItem
                              faq={faq}
                              isOpen={isOpen}
                              onToggle={() => setOpen(isOpen ? null : key)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-xl2 border border-brand-beige/70 bg-white p-6 shadow-soft sm:flex-row sm:items-center">
          <div>
            <h3 className="font-serif text-lg text-brand-forest">
              ¿No encontraste lo que buscabas?
            </h3>
            <p className="mt-1 text-sm text-brand-carbon/60">
              Escríbenos y nuestro equipo te responderá lo antes posible.
            </p>
          </div>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="h-4 w-4" />
            Contactar soporte
          </Link>
        </div>
    </div>
  );
}

function CategoryPill({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
        active
          ? "border-brand-forest bg-brand-forest text-white"
          : "border-brand-beige bg-white text-brand-carbon/70 hover:border-brand-forest/40 hover:text-brand-forest"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function FaqItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: Faq;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = FAQ_ICONS[faq.iconKey];
  return (
    <div
      className={`card-surface overflow-hidden transition-shadow ${
        isOpen ? "shadow-card" : ""
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-sage/70 text-brand-forest">
          <Icon className="h-5 w-5" />
        </span>
        <span className="flex-1 text-sm font-semibold text-brand-carbon">
          {faq.q}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-beige text-brand-carbon/50 transition-transform ${
            isOpen ? "rotate-180 border-brand-forest/30 text-brand-forest" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 pl-[76px] text-sm leading-relaxed text-brand-carbon/65">
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  );
}
