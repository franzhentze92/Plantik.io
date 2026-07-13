"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  HelpCircle,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";

const SUBJECTS = [
  "Preguntas sobre productos",
  "Propuestas y diseño de espacios",
  "Compras y pagos",
  "Envíos y entregas",
  "Cuidado de plantas",
  "Alianzas y colaboraciones",
  "Otro",
];

const CHANNELS = [
  {
    icon: Mail,
    label: "Correo",
    value: "info@plantik.io",
    href: "mailto:info@plantik.io",
  },
  {
    icon: Phone,
    label: "Teléfono",
    value: "+502 4585 4565",
    href: "tel:+50245854565",
  },
  {
    icon: MapPin,
    label: "Ubicación",
    value: "Ciudad de Guatemala, Guatemala",
    href: undefined,
  },
  {
    icon: Clock,
    label: "Horario de atención",
    value: "Lunes a viernes, 9:00 a 18:00 hora Guatemala",
    href: undefined,
  },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    message: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 900);
  }

  return (
    <section className="bg-brand-cream py-8 text-brand-carbon">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-xl2 border border-brand-beige/70 bg-gradient-to-r from-brand-cream via-brand-cream to-brand-sage/50 shadow-soft">
          {/* Plant photo on the right, blended into the panel */}
          <div className="absolute inset-y-0 right-0 w-[55%] sm:w-[48%]">
            <Image
              src="/images/plants/calathea.png"
              alt="Planta en maceta"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Fade the left edge of the photo into the cream panel */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-cream via-brand-cream/40 to-transparent" />
          </div>

          {/* Decorative leaf line-art */}
          <Leaf className="pointer-events-none absolute right-[46%] top-10 h-16 w-16 -rotate-12 text-brand-moss/20" />
          <Leaf className="pointer-events-none absolute right-[40%] bottom-8 h-24 w-24 rotate-12 text-brand-moss/15" />

          <div className="relative max-w-xl p-8 sm:p-12">
            <span className="eyebrow inline-flex items-center gap-2">
              <Leaf className="h-3.5 w-3.5" />
              Contacto
              <Leaf className="h-3.5 w-3.5" />
            </span>
            <h1 className="mt-4 font-serif text-4xl text-brand-forest sm:text-5xl">
              Hablemos de tu espacio
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-carbon/65">
              ¿Tienes dudas sobre productos, tu pedido o quieres contarnos qué
              te gustaría ver en Plantik? Estamos aquí para ayudarte.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-forest/15 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-forest shadow-soft backdrop-blur">
              <Check className="h-4 w-4" />
              Respondemos en menos de 24 horas hábiles.
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* Left column */}
          <div className="space-y-6">
            <div className="card-surface divide-y divide-brand-beige/60 overflow-hidden">
              {CHANNELS.map((channel) => {
                const Icon = channel.icon;
                const inner = (
                  <>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-sage text-brand-forest">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-carbon/50">
                        {channel.label}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-brand-carbon">
                        {channel.value}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-brand-carbon/30" />
                  </>
                );
                return channel.href ? (
                  <a
                    key={channel.label}
                    href={channel.href}
                    className="flex items-center gap-4 p-5 transition-colors hover:bg-brand-sage/30"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={channel.label} className="flex items-center gap-4 p-5">
                    {inner}
                  </div>
                );
              })}
            </div>

            <div className="relative overflow-hidden rounded-xl2 border border-brand-beige/70 bg-brand-sage/40 p-6">
              <Leaf className="pointer-events-none absolute -bottom-4 right-2 h-24 w-24 rotate-12 text-brand-moss/15" />
              <div className="relative flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70 text-brand-forest">
                  <HelpCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-forest">
                    ¿Buscas una respuesta rápida?
                  </p>
                  <p className="mt-1 text-sm text-brand-carbon/65">
                    Conoce cómo funciona Plantik antes de escribirnos.
                  </p>
                  <Link
                    href="/como-funciona"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-forest hover:opacity-70"
                  >
                    Cómo funciona Plantik
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: form */}
          <div className="card-surface p-6 sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                  <Check className="h-7 w-7" />
                </span>
                <h2 className="font-serif text-2xl text-brand-forest">
                  Mensaje enviado
                </h2>
                <p className="max-w-md text-sm text-brand-carbon/65">
                  Gracias, {form.name || "amigo de las plantas"}. Te
                  responderemos a {form.email || "tu correo"} en menos de 24
                  horas hábiles.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setForm((f) => ({ ...f, message: "" }));
                  }}
                  className="mt-2 text-sm font-semibold text-brand-forest hover:opacity-70"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-serif text-xl text-brand-forest">
                      Envíanos un mensaje
                    </h2>
                    <p className="text-sm text-brand-carbon/55">
                      Completa el formulario y te contactaremos pronto.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <IconField
                      label="Nombre"
                      icon={User}
                      value={form.name}
                      onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                      placeholder="Tu nombre"
                      required
                    />
                    <IconField
                      label="Correo"
                      icon={Mail}
                      type="email"
                      value={form.email}
                      onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                      placeholder="tucorreo@ejemplo.com"
                      required
                    />
                  </div>

                  <label className="block">
                    <span className="text-xs font-medium text-brand-carbon/60">
                      Asunto
                    </span>
                    <select
                      value={form.subject}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, subject: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-brand-beige bg-white px-3.5 py-2.5 text-sm text-brand-carbon focus:border-brand-forest/40 focus:outline-none"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-brand-carbon/60">
                      Mensaje
                    </span>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, message: e.target.value }))
                      }
                      placeholder="Cuéntanos en qué podemos ayudarte..."
                      className="mt-1 w-full resize-y rounded-xl border border-brand-beige bg-white px-3.5 py-2.5 text-sm text-brand-carbon placeholder:text-brand-carbon/40 focus:border-brand-forest/40 focus:outline-none"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-forest/90 disabled:opacity-70"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? "Enviando..." : "Enviar mensaje"}
                  </button>

                  <p className="flex items-center gap-1.5 text-xs text-brand-carbon/50">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-forest" />
                    Tu información está segura con nosotros.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function IconField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  icon: typeof User;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-brand-carbon/60">{label}</span>
      <div className="relative mt-1">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-carbon/35" />
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-brand-beige bg-white py-2.5 pl-10 pr-3.5 text-sm text-brand-carbon placeholder:text-brand-carbon/40 focus:border-brand-forest/40 focus:outline-none"
        />
      </div>
    </label>
  );
}
