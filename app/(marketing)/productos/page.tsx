import Image from "next/image";
import Link from "next/link";
import {
  Check,
  CircleDashed,
  Layers,
  Leaf,
  Lock,
  Package,
  Sprout,
  TreePine,
} from "lucide-react";
import { MarketingCatalog } from "@/components/marketing/MarketingCatalog";
import {
  getPlantsFromDB,
  getPlantersFromDB,
  getAccessoriesFromDB,
} from "@/lib/supabase-queries";

export const revalidate = 3600;

export default async function ProductsPage() {
  const [plants, planters, accessories] = await Promise.all([
    getPlantsFromDB(),
    getPlantersFromDB(),
    getAccessoriesFromDB(),
  ]);

  const totalProducts = plants.length + planters.length + accessories.length;

  const platos = accessories.filter((a) => a.category === "plato").length;
  const sustratos = accessories.filter((a) => a.category === "sustrato").length;
  const cubiertas = accessories.filter((a) => a.category === "mulch").length;

  return (
    <div className="min-h-screen bg-brand-cream text-brand-carbon">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-xl2 border border-brand-beige/70 bg-gradient-to-r from-brand-cream via-brand-cream to-brand-sage/50 shadow-soft">
          <div className="absolute inset-y-0 right-0 w-[55%] sm:w-[48%]">
            <Image
              src="/images/plants/monstera-adansonii.png"
              alt="Catálogo de plantas"
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
              Productos
              <Leaf className="h-3.5 w-3.5" />
            </span>
            <h1 className="mt-4 font-serif text-4xl text-brand-forest sm:text-5xl">
              Todo lo que necesita tu espacio
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-carbon/65">
              Explora plantas, macetas y accesorios reales de nuestro catálogo.
              Puedes ver precios y detalles libremente; para comprar solo
              necesitas iniciar sesión.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-forest/15 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-forest shadow-soft backdrop-blur">
              <Lock className="h-4 w-4" />
              Explora gratis · compra con cuenta
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard icon={Sprout} value={plants.length} label="Plantas" />
          <StatCard icon={Package} value={planters.length} label="Macetas" />
          <StatCard icon={CircleDashed} value={platos} label="Platos" />
          <StatCard icon={Layers} value={sustratos} label="Sustratos" />
          <StatCard icon={TreePine} value={cubiertas} label="Cubiertas" />
          <StatCard
            icon={Check}
            value={totalProducts}
            label="Productos en catálogo"
            highlight
          />
        </div>

        <MarketingCatalog
          plants={plants}
          planters={planters}
          accessories={accessories}
        />

        {/* Bottom CTA */}
        <div className="relative mt-16 overflow-hidden rounded-xl2 border border-brand-beige/70 bg-gradient-to-br from-brand-sage/60 via-white to-brand-cream p-10 text-center shadow-soft">
          <Leaf className="pointer-events-none absolute -left-6 -top-6 h-32 w-32 rotate-12 text-brand-moss/10" />
          <div className="relative mx-auto max-w-lg">
            <h2 className="font-serif text-3xl text-brand-forest">
              ¿Listo para llevarlo a tu espacio?
            </h2>
            <p className="mt-3 text-sm text-brand-carbon/65">
              Crea una cuenta gratis para agregar al carrito, guardar favoritos
              y completar tu compra en minutos.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 rounded-full bg-brand-forest px-7 py-3.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-brand-forest/30 bg-white px-7 py-3.5 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/60"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  highlight,
}: {
  icon: typeof Sprout;
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl2 border p-5 shadow-soft ${
        highlight
          ? "border-brand-forest/20 bg-brand-forest text-white"
          : "border-brand-beige/70 bg-white"
      }`}
    >
      <Icon
        className={`h-5 w-5 ${highlight ? "text-brand-sage" : "text-brand-forest"}`}
      />
      <p
        className={`mt-3 font-serif text-3xl ${highlight ? "text-white" : "text-brand-forest"}`}
      >
        {value}
      </p>
      <p
        className={`mt-1 text-xs font-medium ${highlight ? "text-white/70" : "text-brand-carbon/55"}`}
      >
        {label}
      </p>
    </div>
  );
}
