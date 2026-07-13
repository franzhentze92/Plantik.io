import Link from "next/link";

const categories = [
  { label: "Interior", slug: "interior" },
  { label: "Exterior", slug: "exterior" },
  { label: "Escritorio", slug: "escritorio" },
  { label: "Pet friendly", slug: "pet-friendly" },
  { label: "Bajo mantenimiento", slug: "bajo-mantenimiento" },
  { label: "Poca luz", slug: "poca-luz" },
  { label: "Plantas grandes", slug: "grandes" },
  { label: "Regalos", slug: "regalos" },
];

export function Categories() {
  return (
    <section className="container-app py-12 sm:py-16">
      <span className="eyebrow">Explora por categoría</span>
      <h2 className="mt-3 font-serif text-2xl text-brand-forest sm:text-3xl">
        Encuentra la planta según tu espacio y tu ritmo de vida.
      </h2>

      <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/app/plantas?categoria=${c.slug}`}
            className="rounded-full border border-brand-beige bg-white px-5 py-2.5 text-sm font-medium text-brand-carbon/80 transition-colors hover:border-brand-forest hover:text-brand-forest"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
