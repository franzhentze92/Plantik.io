import Link from "next/link";
import { ArrowRight, Camera, Layers, Leaf } from "lucide-react";

const actions = [
  {
    icon: Leaf,
    title: "Explora y compra directo",
    description:
      "Recorre plantas, macetas, sustratos y accesorios. Agrégalos al carrito y listo.",
    cta: "Ver catálogo",
    href: "/app/plantas",
  },
  {
    icon: Camera,
    title: "Diseña con una foto",
    description:
      "Sube una foto de tu espacio y recibe una propuesta pensada para tu luz y estilo.",
    cta: "Subir foto",
    href: "/app/disena-tu-espacio",
  },
  {
    icon: Layers,
    title: "Arma tu planta",
    description:
      "Combina planta, maceta, plato y sustrato a tu gusto y guárdalo como creación.",
    cta: "Empezar a armar",
    href: "/app/arma-tu-planta",
  },
];

export function QuickStart() {
  return (
    <section className="container-app pt-10 sm:pt-14">
      <span className="eyebrow">Formas de empezar</span>
      <h2 className="mt-3 max-w-xl font-serif text-2xl text-brand-forest sm:text-3xl">
        Tres maneras de encontrar tu próxima planta.
      </h2>

      <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="card-surface group flex flex-col p-6 transition-transform hover:-translate-y-0.5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
              <action.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-brand-carbon">
              {action.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-brand-carbon/65">
              {action.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-forest">
              {action.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
