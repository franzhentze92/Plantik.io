import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  HeartPulse,
  Leaf,
  MapPin,
  Sparkles,
  Sprout,
  Target,
  Users,
} from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Diseño con propósito",
    description:
      "Cada recomendación parte de tu espacio real: su luz, su estilo y tu ritmo de vida.",
  },
  {
    icon: Sparkles,
    title: "Tecnología al servicio de las plantas",
    description:
      "Plantik no reemplaza el cuidado de las plantas; hace que elegir bien sea accesible para cualquiera.",
  },
  {
    icon: Users,
    title: "Construido con la comunidad",
    description:
      "Cada función nace de observar cómo las personas eligen, arman y cuidan sus plantas.",
  },
];

const milestones = [
  {
    year: "2023",
    title: "La pregunta inicial",
    description:
      "Un balcón lleno de plantas que no sobrevivían nos hizo preguntarnos por qué seguimos comprando a ciegas.",
  },
  {
    year: "2024",
    title: "Primeras propuestas con Plantik",
    description:
      "Lanzamos el flujo de diseño por foto: subes tu espacio y recibes combinaciones reales en segundos.",
  },
  {
    year: "2025",
    title: "Catálogo completo",
    description:
      "Integramos plantas, macetas y accesorios en una sola experiencia de compra sencilla.",
  },
  {
    year: "Hoy",
    title: "Construyendo contigo",
    description:
      "Cada semana ajustamos catálogo, precios y funciones según lo que realmente resuelve un problema.",
  },
];

const stats = [
  { value: "100+", label: "Especies en catálogo" },
  { value: "4", label: "Pasos para tu propuesta" },
  { value: "24h", label: "Respuesta en soporte" },
  { value: "GT", label: "Hecho en Guatemala" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-carbon">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-xl2 border border-brand-beige/70 bg-gradient-to-r from-brand-cream via-brand-cream to-brand-sage/50 shadow-soft">
          <div className="absolute inset-y-0 right-0 w-[55%] bg-brand-cream sm:w-[48%]">
            <Image
              src="/images/plants/ficus-elastica.png"
              alt="Plantas en invernadero"
              fill
              sizes="(min-width: 640px) 48vw, 55vw"
              className="object-cover object-bottom"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-cream via-brand-cream/40 to-transparent" />
          </div>

          <Leaf className="pointer-events-none absolute right-[46%] top-10 h-16 w-16 -rotate-12 text-brand-moss/20" />
          <Leaf className="pointer-events-none absolute right-[40%] bottom-8 h-24 w-24 rotate-12 text-brand-moss/15" />

          <div className="relative max-w-xl p-8 sm:p-12">
            <span className="eyebrow inline-flex items-center gap-2">
              <Leaf className="h-3.5 w-3.5" />
              Sobre nosotros
              <Leaf className="h-3.5 w-3.5" />
            </span>
            <h1 className="mt-4 font-serif text-4xl text-brand-forest sm:text-5xl">
              Cada espacio merece su propia planta
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-carbon/65">
              Plantik nació de una pregunta simple: ¿por qué comprar plantas sigue
              siendo un juego de adivinanza? Combinamos diseño, datos y cuidado
              inteligente para que la respuesta sea distinta para cada persona.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-forest/15 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-forest shadow-soft backdrop-blur">
              <Sprout className="h-4 w-4" />
              Plantas · Diseño · Bienestar
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl2 border border-brand-beige/70 bg-white p-5 shadow-soft"
            >
              <p className="font-serif text-3xl text-brand-forest">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-brand-carbon/55">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-xl2 border border-brand-beige/70 bg-brand-cream shadow-soft">
            <Image
              src="/images/plants/philodendron-brasil.png"
              alt="Persona cuidando plantas en casa"
              width={1000}
              height={1000}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div>
            <span className="eyebrow">Nuestra historia</span>
            <h2 className="mt-3 font-serif text-3xl text-brand-forest">
              De un balcón lleno de plantas moribundas a un sistema completo
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-brand-carbon/65">
              Empezamos probando cómo la gente decide qué planta comprar: casi
              siempre a partir de una foto en redes sociales, sin considerar la
              luz real de su espacio. Plantik existe para cerrar esa brecha —
              entre lo que ves y lo que tu espacio realmente necesita.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-brand-carbon/65">
              Hoy seguimos construyendo junto a quienes prueban cada versión del
              producto, ajustando precios, catálogo y funciones según lo que
              realmente resuelve un problema.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest">
              <MapPin className="h-4 w-4" />
              Con raíces en Guatemala, pensado para espacios reales.
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-16 rounded-xl2 border border-brand-beige/70 bg-white p-8 shadow-soft sm:p-10">
          <div className="max-w-2xl">
            <span className="eyebrow">Nuestro camino</span>
            <h2 className="mt-3 font-serif text-3xl text-brand-forest">
              Cómo llegamos hasta aquí
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {milestones.map((m, i) => (
              <div key={m.year} className="relative">
                <span className="font-serif text-2xl text-brand-beige">{m.year}</span>
                <h3 className="mt-2 text-base font-semibold text-brand-carbon">
                  {m.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-carbon/60">
                  {m.description}
                </p>
                {i < milestones.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-3 hidden h-5 w-5 text-brand-moss/40 xl:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mt-16">
          <div className="text-center">
            <span className="eyebrow">Lo que nos guía</span>
            <h2 className="mt-3 font-serif text-3xl text-brand-forest">
              Tres principios detrás de cada decisión
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="card-surface p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-sage text-brand-forest">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-brand-carbon">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-carbon/60">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission panel */}
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl2 border border-brand-beige/70 bg-gradient-to-br from-brand-sage/40 to-white p-8 shadow-soft">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-forest shadow-soft">
              <HeartPulse className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-serif text-2xl text-brand-forest">
              Nuestra misión
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-carbon/65">
              Hacer que cualquier persona pueda transformar su espacio con
              plantas — sin adivinar, sin frustrarse y con el apoyo que necesita
              para mantenerlas sanas.
            </p>
          </div>
          <div className="rounded-xl2 border border-brand-beige/70 bg-white p-8 shadow-soft">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-sage text-brand-forest">
              <Check className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-serif text-2xl text-brand-forest">
              Lo que prometemos
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                "Recomendaciones basadas en tu espacio real, no en tendencias.",
                "Catálogo curado con precios transparentes y stock actualizado.",
                "Soporte humano cuando lo necesites, en menos de 24 horas.",
                "Un catálogo que crece contigo: desde tu primera planta hasta tu espacio completo.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-brand-carbon/65"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="relative mt-16 overflow-hidden rounded-xl2 border border-brand-beige/70 bg-gradient-to-br from-brand-sage/60 via-white to-brand-cream p-10 text-center shadow-soft">
          <Leaf className="pointer-events-none absolute -left-6 -top-6 h-32 w-32 rotate-12 text-brand-moss/10" />
          <Leaf className="pointer-events-none absolute -bottom-8 right-6 h-28 w-28 -rotate-12 text-brand-moss/10" />
          <div className="relative mx-auto max-w-xl">
            <h2 className="font-serif text-3xl text-brand-forest">
              ¿Quieres ver Plantik en acción?
            </h2>
            <p className="mt-3 text-sm text-brand-carbon/65">
              Explora el catálogo, prueba el diseñador de espacios o escríbenos
              si tienes preguntas.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/app/disena-tu-espacio"
                className="inline-flex items-center gap-2 rounded-full bg-brand-forest px-7 py-3.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
              >
                <Camera className="h-4 w-4" />
                Diseñar mi espacio
              </Link>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-full border border-brand-forest/30 bg-white px-7 py-3.5 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/60"
              >
                Ver catálogo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
