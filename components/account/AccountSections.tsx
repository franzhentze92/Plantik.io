import Link from "next/link";
import { Leaf, LucideIcon } from "lucide-react";

export function AccountPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <span className="eyebrow inline-flex items-center gap-2">
        <Leaf className="h-3.5 w-3.5" />
        {eyebrow}
        <Leaf className="h-3.5 w-3.5" />
      </span>
      <h1 className="mt-3 font-serif text-4xl text-brand-forest sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm text-brand-carbon/65">
          {description}
        </p>
      )}
    </div>
  );
}

export function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-brand-carbon">{title}</h2>
      {description && (
        <p className="mt-1 text-xs text-brand-carbon/55">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function SettingsToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-brand-beige/60 bg-brand-cream/30 px-4 py-3 transition-colors hover:bg-brand-sage/30">
      <span>
        <span className="block text-sm font-medium text-brand-carbon">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs text-brand-carbon/55">
            {description}
          </span>
        )}
      </span>
      <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-brand-beige transition-colors peer-checked:bg-brand-forest" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-brand-carbon/60">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-brand-beige bg-white px-3.5 py-2.5 text-sm text-brand-carbon focus:border-brand-forest/40 focus:outline-none"
      />
    </label>
  );
}

export function QuickLinkRow({
  icon: Icon,
  label,
  href,
  description,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  description?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-brand-beige/60 bg-white px-4 py-3 transition-colors hover:border-brand-forest/30 hover:bg-brand-sage/30"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-brand-carbon">
          {label}
        </span>
        {description && (
          <span className="block text-xs text-brand-carbon/55">{description}</span>
        )}
      </span>
    </Link>
  );
}
