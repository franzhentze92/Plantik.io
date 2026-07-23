"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Layers,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShoppingBag,
  User,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-api";
import { formatAddressLine } from "@/lib/supabase/account";
import type { AdminUserDetail } from "@/lib/supabase/users-admin";
import { formatOrderStatus, orderStatusBadgeClass } from "@/lib/order-display";
import { cn, formatQ } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("es-GT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = decodeURIComponent(String(params?.id ?? ""));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUserDetail | null>(null);

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(
        `/api/admin/users/${encodeURIComponent(userId)}`
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Error al cargar usuario");
      }
      const data = (await res.json()) as { user: AdminUserDetail };
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const avgOrderValue = useMemo(() => {
    if (!user || user.paidOrderCount === 0) return 0;
    return user.totalSpentQ / user.paidOrderCount;
  }, [user]);

  if (loading) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Cargando usuario...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={User}
          title="Usuario no encontrado"
          description={error ?? "El usuario que buscas no existe."}
          action={
            <Link
              href="/app/admin/usuarios"
              className="rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white"
            >
              Volver al listado
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <Link
        href="/app/admin/usuarios"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a usuarios
      </Link>

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-sage text-xl font-semibold text-brand-forest">
              {initials(user.name)}
            </span>
          )}
          <div>
            <span className="eyebrow inline-flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              Admin · Usuario
            </span>
            <h1 className="mt-1 font-serif text-3xl text-brand-forest sm:text-4xl">
              {user.name}
            </h1>
            <p className="mt-2 text-sm text-brand-carbon/55">
              Registrado el {formatDateTime(user.createdAt)}
              {user.lastOrderAt &&
                ` · Último pedido ${formatDate(user.lastOrderAt)}`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          label="Total gastado"
          value={formatQ(user.totalSpentQ)}
          icon={DollarSign}
        />
        <StatCard
          label="Pedidos"
          value={String(user.orderCount)}
          sub={`${user.paidOrderCount} pagados`}
          icon={ShoppingBag}
        />
        <StatCard
          label="Ticket promedio"
          value={formatQ(avgOrderValue)}
          icon={CreditCard}
        />
        <StatCard
          label="Actividad"
          value={`${user.proposalCount} prop.`}
          sub={`${user.spaceCount} espacios`}
          icon={Layers}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft">
          <h2 className="font-semibold text-brand-forest">Contacto</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <InfoRow icon={Mail} label="Email" value={user.email || "—"} />
            <InfoRow icon={Phone} label="Teléfono" value={user.phone || "—"} />
            <InfoRow icon={User} label="Espacio" value={user.workspace} />
          </dl>
        </div>

        <div className="rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft lg:col-span-2">
          <h2 className="font-semibold text-brand-forest">
            Direcciones ({user.addressCount})
          </h2>
          {user.addresses.length === 0 ? (
            <p className="mt-4 text-sm text-brand-carbon/55">
              Este usuario no tiene direcciones guardadas.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {user.addresses.map((address) => (
                <li
                  key={address.id}
                  className="flex items-start gap-3 rounded-xl border border-brand-beige/70 bg-brand-cream/30 p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-brand-carbon">
                        {address.label}
                      </p>
                      {address.is_default && (
                        <span className="rounded-full bg-brand-forest px-2 py-0.5 text-[10px] font-semibold text-white">
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-brand-carbon/75">
                      {formatAddressLine(address)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {user.cards.length > 0 && (
        <div className="mt-6 rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft">
          <h2 className="font-semibold text-brand-forest">
            Métodos de pago ({user.cardCount})
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {user.cards.map((card) => (
              <li
                key={card.id}
                className="flex items-center gap-3 rounded-xl border border-brand-beige/70 bg-brand-cream/30 p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                  <CreditCard className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-brand-carbon">
                    {card.label || card.brand}
                    {card.is_default && (
                      <span className="ml-2 text-[10px] font-semibold text-brand-forest">
                        · Principal
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-brand-carbon/60">
                    {card.brand} ···· {card.last4}
                  </p>
                  <p className="text-xs text-brand-carbon/45">
                    Exp. {card.exp_month}/{card.exp_year} · {card.cardholder}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 font-serif text-xl text-brand-forest">
          Historial de pedidos
        </h2>
        {user.orders.length === 0 ? (
          <div className="card-surface p-8 text-center text-sm text-brand-carbon/55">
            Este usuario aún no tiene pedidos registrados.
          </div>
        ) : (
          <div className="overflow-hidden card-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-beige/70 bg-brand-cream/50 text-xs uppercase tracking-wide text-brand-carbon/50">
                    <th className="px-4 py-3 font-semibold sm:px-6">Pedido</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Artículos</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold sm:px-6">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-beige/50">
                  {user.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-brand-cream/30">
                      <td className="px-4 py-3.5 font-semibold text-brand-forest sm:px-6">
                        {order.id}
                      </td>
                      <td className="px-4 py-3.5 text-brand-carbon/70">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-brand-carbon/70">
                        {order.itemCount}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-brand-forest">
                        {formatQ(order.totalQ)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            orderStatusBadgeClass(order.status)
                          )}
                        >
                          {formatOrderStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 sm:px-6">
                        <Link
                          href={`/app/admin/pedidos/${encodeURIComponent(order.id)}`}
                          className="text-xs font-semibold text-brand-forest hover:underline"
                        >
                          Ver pedido
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl2 border border-brand-beige bg-white p-6 shadow-soft">
        <h2 className="font-semibold text-brand-forest">Preferencias</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(user.settings).map(([key, value]) => (
            <div
              key={key}
              className="rounded-xl bg-brand-cream/40 px-3 py-2 text-sm"
            >
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-brand-carbon/45">
                {settingLabel(key)}
              </dt>
              <dd className="mt-0.5 text-brand-carbon/80">
                {typeof value === "boolean" ? (value ? "Sí" : "No") : String(value)}
              </dd>
            </div>
          ))}
          {Object.keys(user.settings).length === 0 && (
            <p className="text-sm text-brand-carbon/55">
              Sin preferencias guardadas.
            </p>
          )}
        </dl>
      </div>

      <div className="mt-6 rounded-xl2 border border-brand-beige/70 bg-brand-cream/30 px-4 py-3 text-xs text-brand-carbon/50">
        <p>
          <span className="font-semibold">ID de cuenta:</span> {user.sessionId}
        </p>
        <p className="mt-1">
          <span className="font-semibold">UUID:</span> {user.id}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof DollarSign;
}) {
  return (
    <div className="card-surface p-4 sm:p-5">
      <Icon className="h-4 w-4 text-brand-forest" />
      <p className="mt-3 font-serif text-2xl text-brand-forest">{value}</p>
      <p className="text-xs font-medium text-brand-carbon/70">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-brand-carbon/45">{sub}</p>}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-wide text-brand-carbon/45">
          {label}
        </dt>
        <dd className="break-all text-brand-carbon/80">{value}</dd>
      </div>
    </div>
  );
}

function settingLabel(key: string): string {
  const labels: Record<string, string> = {
    emailNotifications: "Notificaciones por email",
    orderUpdates: "Actualizaciones de pedidos",
    designTips: "Tips de diseño",
    marketingEmails: "Emails de marketing",
    petFriendlyDefault: "Pet friendly por defecto",
    lowMaintenanceDefault: "Bajo mantenimiento por defecto",
  };
  return labels[key] ?? key;
}
