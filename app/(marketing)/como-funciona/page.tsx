import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  Leaf,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

const steps = [
  {
    icon: Camera,
    n: "01",
    title: "Sube una foto de tu espacio",
    description:
      "Arrastra una imagen, selecciona un archivo o usa una de nuestras fotos de demostración. Funciona con dormitorios, salas, oficinas y balcones.",
  },
  {
    icon: Sparkles,
    n: "02",
    title: "Recibe un análisis en segundos",
    description:
      "Evaluamos iluminación aparente, estilo decorativo y espacios disponibles para armar una propuesta hecha a la medida de tu foto.",
  },
  {
    icon: SlidersHorizontal,
    n: "03",
    title: "Personaliza cada detalle",
    description:
      "Cambia la planta, la maceta o los accesorios hasta lograr la combinación perfecta para tu espacio.",
  },
  {
    icon: PackageCheck,
    n: "04",
    title: "Guarda o recibe tu propuesta",
    description:
      "Guarda tu combinación para decidir con calma, o continúa hacia la entrega, el trasplante o la instalación.",
  },
];

const benefits = [
  {
    icon: Sparkles,
    title: "Recomendaciones a tu medida",
    description:
      "Cada sugerencia parte de la luz real de tu espacio, tu estilo y tu ritmo de vida.",
  },
  {
    icon: ShieldCheck,
    title: "Sin adivinar",
    description:
      "Olvídate de comprar por impulso. Sabrás si una planta funciona antes de llevarla.",
  },
  {
    icon: ShoppingBag,
    title: "Compra directa, sin fotos",
    description:
      "¿Ya sabes lo que quieres? Explora el catálogo y compra plantas, macetas o accesorios individuales al instante.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-carbon">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-xl2 border border-brand-beige/70 bg-gradient-to-r from-brand-cream via-brand-cream to-brand-sage/50 shadow-soft">
          <div className="absolute inset-y-0 right-0 w-[55%] sm:w-[48%]">
            <Image
              src="/images/plants/monstera-deliciosa.png"
              alt="Espacio con plantas"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-cream via-brand-cream/40 to-transparent" />
          </div>

          <Leaf className="pointer-events-none absolute right-[46%] top-10 h-16 w-16 -rotate-12 text-brand-moss/20" />
          <Leaf className="pointer-events-none absolute right-[40%] bottom-8 h-24 w-24 rotate-12 text-brand-moss/15" />

          <div className="relative max-w-xl p-8 sm:p-12">
            <span className="eyebrow inline-flex items-center gap-2">
              <Leaf className="h-3.5 w-3.5" />
              Cómo funciona
              <Leaf className="h-3.5 w-3.5" />
            </span>
            <h1 className="mt-4 font-serif text-4xl text-brand-forest sm:text-5xl">
              Compra directo o diseña con una foto
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-carbon/65">
              En Plantik puedes comprar plantas, macetas y accesorios
              individuales cuando quieras. Y si buscas inspiración, el diseño
              con foto es una opción extra — nunca un requisito.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-forest/15 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-forest shadow-soft backdrop-blur">
              <Check className="h-4 w-4" />
              Menos de 2 minutos · sin crear cuenta.
            </div>
          </div>
        </div>

        {/* Two ways to use Plantik */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="card-surface flex flex-col p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-sage text-brand-forest">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <h2 className="mt-5 font-serif text-2xl text-brand-forest">
              1 · Compra directa
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-carbon/65">
              Entra al catálogo, filtra por luz, tamaño o mascota, y compra la
              planta, maceta o accesorio que quieras — de forma individual y sin
              subir ninguna foto.
            </p>
            <ul className="mt-4 space-y-2">
              {[
                "Explora plantas, macetas y accesorios reales",
                "Compra productos individuales al instante",
                "Sin fotos ni pasos obligatorios",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-brand-carbon/65"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/productos"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-4 w-4" />
              Explorar catálogo
            </Link>
          </div>

          <div className="card-surface flex flex-col p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-sage text-brand-forest">
              <Camera className="h-5 w-5" />
            </span>
            <h2 className="mt-5 font-serif text-2xl text-brand-forest">
              2 · Diseña con una foto{" "}
              <span className="text-sm font-normal text-brand-carbon/50">
                (opcional)
              </span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-carbon/65">
              ¿Prefieres inspiración? Sube una foto de tu espacio y deja que la
              IA te proponga combinaciones a tu medida. Es una función extra
              para quienes la quieran usar.
            </p>
            <ul className="mt-4 space-y-2">
              {[
                "Recomendaciones según la luz y el estilo de tu foto",
                "Combinaciones listas de planta + maceta",
                "Puedes comprar lo que te propongan o ajustarlo",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-brand-carbon/65"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/app/disena-tu-espacio"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-brand-forest/30 bg-white px-6 py-3 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/60"
            >
              <Camera className="h-4 w-4" />
              Diseñar mi espacio
            </Link>
          </div>
        </div>

        {/* Steps */}
        <div className="mt-14">
          <div className="text-center">
            <span className="eyebrow">Diseño con foto · opcional</span>
            <h2 className="mt-3 font-serif text-3xl text-brand-forest">
              Cómo funciona el diseño con IA
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-brand-carbon/60">
              Si eliges la ruta de inspiración, estos son los 4 pasos. Comprar
              productos sueltos no requiere ninguno de ellos.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className="card-surface relative flex flex-col p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-sage text-brand-forest">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="font-serif text-3xl text-brand-beige">
                    {step.n}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-brand-carbon">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-carbon/60">
                  {step.description}
                </p>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-brand-moss/40 xl:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-16 rounded-xl2 border border-brand-beige/70 bg-white p-8 shadow-soft sm:p-10">
          <div className="max-w-2xl">
            <span className="eyebrow">Por qué Plantik</span>
            <h2 className="mt-3 font-serif text-3xl text-brand-forest">
              Diseñado para que aciertes a la primera
            </h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-sage text-brand-forest">
                  <b.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-brand-carbon">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-carbon/60">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="relative mt-8 overflow-hidden rounded-xl2 border border-brand-beige/70 bg-gradient-to-br from-brand-sage/60 via-white to-brand-cream p-10 text-center shadow-soft">
          <Leaf className="pointer-events-none absolute -left-6 -top-6 h-32 w-32 rotate-12 text-brand-moss/10" />
          <Leaf className="pointer-events-none absolute -bottom-8 right-6 h-28 w-28 -rotate-12 text-brand-moss/10" />
          <div className="relative mx-auto max-w-xl">
            <h2 className="font-serif text-3xl text-brand-forest">
              ¿Empezamos?
            </h2>
            <p className="mt-3 text-sm text-brand-carbon/65">
              Compra directo desde el catálogo o prueba el diseño con foto. Tú
              eliges cómo quieres empezar.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-full bg-brand-forest px-7 py-3.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="h-4 w-4" />
                Explorar catálogo
              </Link>
              <Link
                href="/app/disena-tu-espacio"
                className="inline-flex items-center gap-2 rounded-full border border-brand-forest/30 bg-white px-7 py-3.5 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/60"
              >
                <Camera className="h-4 w-4" />
                Diseñar mi espacio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
