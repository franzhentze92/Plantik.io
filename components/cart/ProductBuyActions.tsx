"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { CartItem, useCartStore } from "@/lib/store";
import { track } from "@/lib/analytics";
import { formatQ } from "@/lib/utils";

const DEFAULT_MAX_QTY = 99;
const LOW_STOCK_THRESHOLD = 5;

export function ProductBuyActions({
  cartItem,
  priceQ,
  stockQuantity = DEFAULT_MAX_QTY,
  soldOut = stockQuantity <= 0,
  children,
}: {
  cartItem: Omit<CartItem, "qty">;
  priceQ: number;
  stockQuantity?: number;
  soldOut?: boolean;
  children?: ReactNode;
}) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.add);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const maxQty = soldOut ? 1 : stockQuantity;
  const clampedQty = Math.min(qty, maxQty);

  function handleAddToCart() {
    if (soldOut) return;
    addToCart(cartItem, clampedQty);
    track("add_to_cart", { productId: cartItem.id, priceQ });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  function handleBuyNow() {
    if (soldOut) return;
    addToCart(cartItem, clampedQty);
    track("add_to_cart", { productId: cartItem.id, priceQ });
    router.push("/app/carrito");
  }

  return (
    <div>
      <div className="mt-5 flex items-baseline gap-3">
        <p className="font-serif text-2xl text-brand-forest">{formatQ(priceQ)}</p>
        {soldOut ? (
          <span className="rounded-full bg-brand-carbon/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-carbon/60">
            Agotado
          </span>
        ) : stockQuantity <= LOW_STOCK_THRESHOLD ? (
          <span className="rounded-full bg-brand-terracotta/15 px-2.5 py-0.5 text-[11px] font-semibold text-brand-terracotta">
            Últimas {stockQuantity} unidades
          </span>
        ) : (
          <span className="rounded-full bg-brand-sage px-2.5 py-0.5 text-[11px] font-semibold text-brand-forest">
            Disponible
          </span>
        )}
      </div>

      {!soldOut && (
        <div className="mt-5 flex items-center gap-3">
          <span className="text-xs font-medium text-brand-carbon/60">Cantidad</span>
          <div className="flex items-center gap-1 rounded-full border border-brand-beige bg-white">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={clampedQty <= 1}
              aria-label="Menos"
              className="flex h-9 w-9 items-center justify-center rounded-full text-brand-carbon/70 transition-colors hover:text-brand-forest disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-semibold text-brand-carbon">
              {clampedQty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={clampedQty >= maxQty}
              aria-label="Más"
              className="flex h-9 w-9 items-center justify-center rounded-full text-brand-carbon/70 transition-colors hover:text-brand-forest disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          {clampedQty >= maxQty && maxQty <= LOW_STOCK_THRESHOLD && (
            <span className="text-[11px] text-brand-carbon/45">Máximo disponible</span>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={soldOut}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-forest/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          {soldOut ? "Agotado" : "Comprar ahora"}
        </button>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={soldOut}
          className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold shadow-card transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            justAdded
              ? "border-brand-forest bg-brand-sage text-brand-forest"
              : "border-brand-forest/30 bg-white text-brand-forest hover:bg-brand-sage/60"
          }`}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" />
              Agregado al carrito
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Agregar al carrito
            </>
          )}
        </button>

        {children}
      </div>
    </div>
  );
}
