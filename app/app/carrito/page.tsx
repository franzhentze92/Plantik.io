"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CreditCard,
  Layers,
  Leaf,
  Mail,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Confetti } from "@/components/ui/Confetti";
import { track } from "@/lib/analytics";
import {
  calculateShippingQ,
  CHECKOUT_FREE_SHIPPING_THRESHOLD_Q,
  PENDING_CHECKOUT_STORAGE_KEY,
  type PendingCheckoutOrder,
} from "@/lib/checkout-order";
import { persistCheckoutOrder } from "@/lib/persist-order";
import { getAccountOwnerId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import {
  formatAddressLine,
  getAddressesBySession,
  getCardsBySession,
  type UserPaymentCard,
} from "@/lib/supabase/account";
import { formatQ } from "@/lib/utils";
import { Order, useCartStore, useOrdersStore, useProfileStore } from "@/lib/store";

type Step = "cart" | "checkout" | "success";

const CARD_BRAND_LABEL: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
};

function formatDeliveryDate(fromISO: string): string {
  const next = new Date(new Date(fromISO).getTime() + 24 * 60 * 60 * 1000);
  const label = next.toLocaleDateString("es-GT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("cart");
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [checkoutPrefilled, setCheckoutPrefilled] = useState(false);
  const [defaultCard, setDefaultCard] = useState<UserPaymentCard | null>(null);
  const [hasSavedAddress, setHasSavedAddress] = useState(true);

  const items = useCartStore((s) => s.items);
  const profile = useProfileStore((s) => s.profile);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const addOrder = useOrdersStore((s) => s.addOrder);
  const setOrders = useOrdersStore((s) => s.setOrders);

  useEffect(() => {
    setMounted(true);
    track("page_view", { route: "/app/carrito" });
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const orderId = params.get("order");
    if (payment !== "success" || !orderId) return;

    let active = true;

    async function finalizeRecurrenteReturn() {
      setIsPaying(true);
      setPayError(null);

      try {
        const raw = localStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY);
        const pending = raw
          ? (JSON.parse(raw) as PendingCheckoutOrder)
          : null;

        if (!pending || pending.orderId !== orderId) {
          throw new Error(
            "No encontramos los datos del pago. Revisa Mis pedidos o contacta soporte."
          );
        }

        const res = await fetch("/api/checkout/recurrente/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            checkoutId: pending.checkoutId,
            orderId: pending.orderId,
          }),
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "No se pudo verificar el pago.");
        }

        const verify = (await res.json()) as { paid: boolean; orderId: string | null };

        if (!verify.paid) {
          throw new Error("El pago aún no está confirmado. Intenta de nuevo en unos segundos.");
        }

        const ownerId = await getAccountOwnerId();
        const { getOrdersBySessionId } = await import("@/lib/supabase/orders");
        const orders = await getOrdersBySessionId(ownerId);
        const order =
          orders.find((o) => o.id === pending.orderId) ??
          ({
            id: pending.orderId,
            items: pending.items.map((i) => ({
              id: i.id,
              kind: i.kind,
              name: i.name,
              subtitle: i.subtitle,
              image: i.image,
              priceQ: i.priceQ,
              qty: i.qty,
              components: i.components,
            })),
            subtotalQ: pending.subtotalQ,
            shippingQ: pending.shippingQ,
            totalQ: pending.totalQ,
            createdAt: pending.createdAt,
            status: "en_proceso" as const,
            customerName: pending.customer.name,
            customerEmail: pending.customer.email,
            customerAddress: pending.customer.address,
            checkoutId: pending.checkoutId,
          } satisfies Order);

        if (!active) return;

        localStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
        setOrders(orders);
        addOrder(order);
        clear();
        setLastOrder(order);
        setStep("success");
        track("checkout_completed", { priceQ: order.totalQ });

        window.history.replaceState({}, "", "/app/carrito");
      } catch (err) {
        if (active) {
          setPayError(err instanceof Error ? err.message : "Error al confirmar el pago.");
          setStep("checkout");
        }
      } finally {
        if (active) setIsPaying(false);
      }
    }

    void finalizeRecurrenteReturn();

    return () => {
      active = false;
    };
  }, [mounted, addOrder, setOrders, clear]);

  useEffect(() => {
    if (step !== "checkout" || checkoutPrefilled) return;

    async function prefillCheckout() {
      const ownerId = await getAccountOwnerId();
      const [addresses, cards] = await Promise.all([
        getAddressesBySession(ownerId),
        getCardsBySession(ownerId),
      ]);
      const defaultAddress =
        addresses.find((a) => a.is_default) ?? addresses[0];
      const card = cards.find((c) => c.is_default) ?? cards[0];

      setDefaultCard(card ?? null);
      setHasSavedAddress(Boolean(defaultAddress));
      setForm({
        name: profile.name,
        email: profile.email,
        address: defaultAddress ? formatAddressLine(defaultAddress) : "",
      });
      setCheckoutPrefilled(true);
    }

    prefillCheckout();
  }, [step, checkoutPrefilled, profile.name, profile.email]);

  const subtotal = items.reduce((sum, i) => sum + i.priceQ * i.qty, 0);
  const shipping = calculateShippingQ(subtotal);
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setIsPaying(true);
    setPayError(null);
    track("checkout_started", { priceQ: total });

    try {
      const ownerId = await getAccountOwnerId();
      const order = await persistCheckoutOrder({
        items,
        subtotalQ: subtotal,
        shippingQ: shipping,
        totalQ: total,
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
        },
        sessionId: ownerId,
        status: "en_proceso",
        paymentMethod: defaultCard ? "saved_card" : "direct",
      });

      addOrder(order);
      track("checkout_completed", { priceQ: total });
      setLastOrder(order);
      clear();
      setStep("success");
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "No se pudo completar el pedido.");
    } finally {
      setIsPaying(false);
    }
  }

  async function handleRecurrentePay() {
    setIsPaying(true);
    setPayError(null);
    track("checkout_started", { priceQ: total });

    try {
      const ownerId = await getAccountOwnerId();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/checkout/recurrente", {
        method: "POST",
        headers,
        body: JSON.stringify({
          items,
          sessionId: ownerId,
          customer: {
            name: form.name.trim(),
            email: form.email.trim(),
            address: form.address.trim(),
          },
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "No se pudo iniciar el pago con tarjeta.");
      }

      const data = (await res.json()) as {
        checkoutUrl: string;
        pendingOrder: PendingCheckoutOrder;
      };

      localStorage.setItem(
        PENDING_CHECKOUT_STORAGE_KEY,
        JSON.stringify(data.pendingOrder)
      );
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setPayError(
        err instanceof Error ? err.message : "No se pudo iniciar el pago con tarjeta."
      );
      setIsPaying(false);
    }
  }

  if (!mounted) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Cargando...</p>
      </div>
    );
  }

  if (step === "success" && lastOrder) {
    const deliveryLabel = formatDeliveryDate(lastOrder.createdAt);
    const email = lastOrder.customerEmail || "tu correo";

    return (
      <div className="relative overflow-hidden">
        <Confetti />

        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand-sage/50 blur-3xl" />
          <Leaf className="absolute -left-10 top-24 h-56 w-56 rotate-12 text-brand-moss/[0.07]" />
          <Leaf className="absolute -right-12 top-1/2 h-48 w-48 -rotate-12 text-brand-moss/[0.06]" />
        </div>

        <div className="container-app py-16">
          <div className="mx-auto max-w-lg text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-forest text-white shadow-card">
              <Check className="h-8 w-8" />
            </span>
            <h1 className="mt-6 font-serif text-3xl text-brand-forest">
              ¡Pago realizado!
            </h1>
            <p className="mt-2 text-sm text-brand-carbon/65">
              Tu pedido <strong>{lastOrder.id}</strong> se procesó
              correctamente.
            </p>

            <div className="card-surface mt-8 overflow-hidden text-left">
              {/* Delivery + invoice highlights */}
              <div className="grid gap-px bg-brand-beige/60 sm:grid-cols-2">
                <div className="flex items-start gap-3 bg-white p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                    <Truck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-carbon/45">
                      Entrega estimada
                    </p>
                    <p className="text-sm font-semibold text-brand-carbon">
                      Mañana
                    </p>
                    <p className="text-xs text-brand-carbon/55">
                      {deliveryLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-carbon/45">
                      Confirmación y factura
                    </p>
                    <p className="truncate text-sm font-semibold text-brand-carbon">
                      {email}
                    </p>
                    <p className="text-xs text-brand-carbon/55">
                      Te la enviamos por correo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between border-b border-brand-beige/60 pb-3">
                  <span className="text-sm font-semibold text-brand-carbon">
                    Resumen del pedido
                  </span>
                  <span className="rounded-full bg-brand-sage px-2.5 py-0.5 text-[11px] font-semibold text-brand-forest">
                    Pagado
                  </span>
                </div>
                <ul className="mt-3 space-y-3">
                  {lastOrder.items.map((i) => (
                    <li key={i.id} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-brand-beige/60 bg-brand-cream">
                        {i.image && (
                          <Image
                            src={i.image}
                            alt={i.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-brand-carbon/80">
                          {i.name}
                        </p>
                        <p className="text-xs text-brand-carbon/50">
                          Cantidad: {i.qty}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-brand-carbon/75">
                        {formatQ(i.priceQ * i.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between border-t border-brand-beige/60 pt-3 text-sm font-semibold text-brand-forest">
                  <span>Total pagado</span>
                  <span>{formatQ(lastOrder.totalQ)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/app/pedidos"
                className="rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card"
              >
                Ver mis pedidos
              </Link>
              <Link
                href="/app/plantas"
                className="rounded-full border border-brand-forest/30 bg-white px-6 py-3 text-sm font-semibold text-brand-forest"
              >
                Seguir explorando
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Tu carrito está vacío"
          description="Explora el catálogo y agrega tus plantas y macetas favoritas."
          action={
            <Link
              href="/app/plantas"
              className="rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white"
            >
              Explorar catálogo
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      {step === "checkout" ? (
        <button
          type="button"
          onClick={() => setStep("cart")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al carrito
        </button>
      ) : (
        <>
          <span className="eyebrow">Carrito</span>
          <h1 className="mt-3 font-serif text-4xl text-brand-forest sm:text-5xl">
            Tu carrito
          </h1>
          <p className="mt-2 text-sm text-brand-carbon/65">
            {itemCount} artículo{itemCount !== 1 ? "s" : ""} listo
            {itemCount !== 1 ? "s" : ""} para comprar.
          </p>
        </>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {step === "checkout" ? (
            <div className="card-surface p-6">
              <h2 className="font-serif text-xl text-brand-forest">
                Datos de envío y pago
              </h2>
              <p className="mt-1 text-sm text-brand-carbon/60">
                Confirma tus datos de entrega. Puedes pagar con tarjeta o confirmar el pedido directamente.
              </p>

              {payError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {payError}
                </div>
              )}

              <form onSubmit={(e) => void handlePay(e)} className="mt-6 space-y-4">
                <Field
                  label="Nombre completo"
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  required
                />
                <Field
                  label="Correo electrónico"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  required
                />
                <div>
                  <Field
                    label="Dirección de entrega"
                    value={form.address}
                    onChange={(v) => setForm((f) => ({ ...f, address: v }))}
                    required
                  />
                  {!hasSavedAddress && (
                    <p className="mt-1.5 text-xs text-brand-carbon/50">
                      No encontramos una dirección guardada.{" "}
                      <Link
                        href="/app/perfil"
                        className="font-semibold text-brand-forest hover:opacity-70"
                      >
                        Guardar una en tu perfil
                      </Link>{" "}
                      para autocompletarla la próxima vez.
                    </p>
                  )}
                </div>

                {defaultCard ? (
                  <div className="rounded-xl2 border border-brand-beige bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                          <CreditCard className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-brand-carbon">
                            {CARD_BRAND_LABEL[defaultCard.brand] ??
                              defaultCard.brand}{" "}
                            ···· {defaultCard.last4}
                          </p>
                          <p className="text-xs text-brand-carbon/55">
                            {defaultCard.cardholder} · Exp.{" "}
                            {defaultCard.exp_month}/
                            {defaultCard.exp_year.slice(-2)}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-brand-sage px-2.5 py-0.5 text-[11px] font-semibold text-brand-forest">
                        Principal
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-brand-carbon/50">
                      Pago simulado con tu tarjeta guardada.{" "}
                      <Link
                        href="/app/perfil"
                        className="font-semibold text-brand-forest hover:opacity-70"
                      >
                        Cambiar
                      </Link>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl2 border border-dashed border-brand-beige bg-brand-cream/50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-brand-carbon/70">
                      <CreditCard className="h-4 w-4 text-brand-forest" />
                      Pago con tarjeta (simulado)
                    </div>
                    <p className="mt-1 text-xs text-brand-carbon/50">
                      No tienes tarjetas guardadas.{" "}
                      <Link
                        href="/app/perfil"
                        className="font-semibold text-brand-forest hover:opacity-70"
                      >
                        Agregar una tarjeta
                      </Link>{" "}
                      para agilizar tus compras.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPaying}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-forest/90 disabled:opacity-70"
                >
                  {isPaying ? "Procesando..." : `Confirmar pedido · ${formatQ(total)}`}
                </button>
                <button
                  type="button"
                  disabled={isPaying}
                  onClick={() => void handleRecurrentePay()}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-6 py-3.5 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/40 disabled:opacity-70"
                >
                  <CreditCard className="h-4 w-4" />
                  Pagar con tarjeta
                </button>
              </form>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="card-surface flex gap-4 p-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-brand-cream">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-brand-carbon">
                        {item.kind === "creacion" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-sage px-2 py-0.5 text-[10px] font-semibold text-brand-forest">
                            <Layers className="h-2.5 w-2.5" />
                            Creación
                          </span>
                        )}
                        {item.kind === "propuesta" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-sage px-2 py-0.5 text-[10px] font-semibold text-brand-forest">
                            <Layers className="h-2.5 w-2.5" />
                            Propuesta
                          </span>
                        )}
                        {item.name}
                      </h3>
                      {item.subtitle && (
                        <p className="text-xs text-brand-carbon/50">
                          {item.subtitle}
                        </p>
                      )}
                      {item.components && item.components.length > 0 && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id],
                              }))
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-forest transition-colors hover:opacity-70"
                          >
                            {expanded[item.id] ? "Ocultar detalle" : "Ver detalle"}
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${
                                expanded[item.id] ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {expanded[item.id] && (
                            <ul className="mt-2 space-y-1 rounded-xl bg-brand-cream/60 p-3">
                              {item.components.map((c, idx) => (
                                <li
                                  key={idx}
                                  className="flex justify-between gap-3 text-[11px]"
                                >
                                  <span className="text-brand-carbon/55">
                                    {c.label}
                                  </span>
                                  <span className="flex-1 truncate text-right text-brand-carbon/80">
                                    {c.name}
                                  </span>
                                  <span className="shrink-0 text-brand-carbon/50">
                                    {c.priceQ === 0 ? "—" : formatQ(c.priceQ)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label="Quitar"
                      className="text-brand-carbon/40 transition-colors hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center gap-1 rounded-full border border-brand-beige">
                      <button
                        type="button"
                        onClick={() => setQty(item.id, item.qty - 1)}
                        aria-label="Menos"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-brand-carbon/70 hover:text-brand-forest"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-brand-carbon">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(item.id, item.qty + 1)}
                        aria-label="Más"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-brand-carbon/70 hover:text-brand-forest"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-brand-forest">
                      {formatQ(item.priceQ * item.qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {step === "cart" && (
            <button
              type="button"
              onClick={clear}
              className="text-xs font-medium text-brand-carbon/55 transition-colors hover:text-red-500"
            >
              Vaciar carrito
            </button>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card-surface p-6">
            <h2 className="font-serif text-lg text-brand-forest">Resumen</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-brand-carbon/70">
                <dt>Subtotal</dt>
                <dd>{formatQ(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-brand-carbon/70">
                <dt>Envío</dt>
                <dd>{shipping > 0 ? formatQ(shipping) : "Gratis"}</dd>
              </div>
              {subtotal > 0 && subtotal < CHECKOUT_FREE_SHIPPING_THRESHOLD_Q && (
                <p className="text-[11px] text-brand-carbon/45">
                  Envío gratis en pedidos desde {formatQ(CHECKOUT_FREE_SHIPPING_THRESHOLD_Q)}
                </p>
              )}
              <div className="flex justify-between border-t border-brand-beige/60 pt-3 text-base font-semibold text-brand-forest">
                <dt>Total</dt>
                <dd>{formatQ(total)}</dd>
              </div>
            </dl>

            {step === "cart" && (
              <button
                type="button"
                onClick={() => setStep("checkout")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
              >
                <CreditCard className="h-4 w-4" />
                Proceder al pago
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-brand-carbon/60">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-brand-beige bg-white px-3.5 py-2.5 text-sm text-brand-carbon focus:border-brand-forest/40 focus:outline-none"
      />
    </label>
  );
}
