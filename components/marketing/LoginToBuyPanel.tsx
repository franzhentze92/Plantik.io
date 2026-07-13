import Link from "next/link";
import { ArrowRight, Lock, UserPlus } from "lucide-react";
import { formatQ } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 5;

export function LoginToBuyPanel({
  priceQ,
  stockQuantity,
  soldOut = (stockQuantity ?? 1) <= 0,
  loginNext,
}: {
  priceQ: number;
  stockQuantity?: number;
  soldOut?: boolean;
  loginNext: string;
}) {
  const loginHref = `/login?next=${encodeURIComponent(loginNext)}`;
  const registerHref = `/registro?next=${encodeURIComponent(loginNext)}`;

  return (
    <div className="mt-6 rounded-xl2 border border-brand-beige/70 bg-brand-cream/50 p-6">
      <div className="flex items-baseline gap-3">
        <p className="font-serif text-2xl text-brand-forest">{formatQ(priceQ)}</p>
        {soldOut ? (
          <span className="rounded-full bg-brand-carbon/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-carbon/60">
            Agotado
          </span>
        ) : stockQuantity !== undefined && stockQuantity <= LOW_STOCK_THRESHOLD ? (
          <span className="rounded-full bg-brand-terracotta/15 px-2.5 py-0.5 text-[11px] font-semibold text-brand-terracotta">
            Últimas {stockQuantity} unidades
          </span>
        ) : (
          <span className="rounded-full bg-brand-sage px-2.5 py-0.5 text-[11px] font-semibold text-brand-forest">
            Disponible
          </span>
        )}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-brand-forest/10 bg-white p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
          <Lock className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-brand-carbon">
            Inicia sesión para comprar
          </p>
          <p className="mt-1 text-xs leading-relaxed text-brand-carbon/60">
            Puedes explorar el catálogo libremente. Para agregar al carrito,
            guardar favoritos o completar tu compra necesitas una cuenta.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href={loginHref}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-forest/90"
        >
          Iniciar sesión
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={registerHref}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-6 py-3 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/60"
        >
          <UserPlus className="h-4 w-4" />
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
