import Image from "next/image";
import { Check, Leaf, Sprout } from "lucide-react";

const DEFAULT_BENEFITS = [
  "Guarda propuestas y favoritos en un solo lugar",
  "Compra plantas, macetas y accesorios del catálogo",
  "Diseña tu espacio con Plantik en menos de 2 minutos",
  "Sigue tus pedidos y tu historial de compras",
];

export function AuthPageLayout({
  eyebrow,
  title,
  subtitle,
  benefits = DEFAULT_BENEFITS,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  benefits?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-carbon">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid min-h-[calc(100vh-10rem)] gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
          {/* Branding panel */}
          <div className="relative hidden overflow-hidden rounded-xl2 border border-brand-beige/70 bg-gradient-to-br from-brand-sage/50 via-brand-cream to-white shadow-soft lg:flex lg:flex-col">
            <div className="absolute inset-y-0 right-0 w-[55%]">
              <Image
                src="/images/plants/pothos-golden.png"
                alt="Planta en escritorio"
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-cream via-brand-cream/70 to-transparent" />
            </div>

            <Leaf className="pointer-events-none absolute right-[42%] top-12 h-16 w-16 -rotate-12 text-brand-moss/20" />
            <Leaf className="pointer-events-none absolute bottom-10 right-[36%] h-24 w-24 rotate-12 text-brand-moss/15" />

            <div className="relative flex flex-1 flex-col justify-between p-10 xl:p-12">
              <div>
                <span className="eyebrow inline-flex items-center gap-2">
                  <Sprout className="h-3.5 w-3.5" />
                  {eyebrow}
                </span>
                <h1 className="mt-4 max-w-sm font-serif text-4xl leading-tight text-brand-forest">
                  {title}
                </h1>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-carbon/65">
                  {subtitle}
                </p>
              </div>

              <ul className="mt-10 space-y-3">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2.5 text-sm text-brand-carbon/70"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                      <Check className="h-3 w-3" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form panel */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthFormCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof Sprout;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl2 border border-brand-beige/70 bg-white p-6 shadow-soft sm:p-8">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-sage text-brand-forest lg:hidden">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-serif text-2xl text-brand-forest lg:mt-0">
          {title}
        </h2>
        <p className="mt-2 text-sm text-brand-carbon/60">{subtitle}</p>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function AuthIconField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  icon: typeof Sprout;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
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
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-brand-beige bg-white py-2.5 pl-10 pr-3.5 text-sm text-brand-carbon placeholder:text-brand-carbon/40 focus:border-brand-forest/40 focus:outline-none focus:ring-2 focus:ring-brand-forest/10"
        />
      </div>
    </label>
  );
}
