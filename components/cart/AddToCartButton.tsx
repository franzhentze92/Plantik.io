"use client";

import { useRouter } from "next/navigation";
import { Check, ShoppingCart } from "lucide-react";
import { CartItem, useCartStore } from "@/lib/store";
import { track } from "@/lib/analytics";

type Variant = "card" | "detail";

export function AddToCartButton({
  item,
  variant = "card",
  buyNow = false,
  disabled = false,
}: {
  item: Omit<CartItem, "qty">;
  variant?: Variant;
  buyNow?: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const inCart = useCartStore((s) => s.items.some((i) => i.id === item.id));

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    add(item);
    track("add_to_cart", { productId: item.id, priceQ: item.priceQ });
    if (buyNow) router.push("/app/carrito");
  }

  if (variant === "detail") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className={
          buyNow
            ? "inline-flex items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-forest/90 disabled:cursor-not-allowed disabled:opacity-50"
            : "inline-flex items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-6 py-3 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/60 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        <ShoppingCart className="h-4 w-4" />
        {buyNow ? "Comprar ahora" : inCart ? "Agregar otra" : "Agregar al carrito"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
        inCart
          ? "border border-brand-forest/30 bg-brand-sage text-brand-forest"
          : "bg-brand-forest text-white hover:bg-brand-forest/90"
      }`}
    >
      {inCart ? (
        <>
          <Check className="h-3.5 w-3.5" />
          En el carrito
        </>
      ) : (
        <>
          <ShoppingCart className="h-3.5 w-3.5" />
          Agregar al carrito
        </>
      )}
    </button>
  );
}
