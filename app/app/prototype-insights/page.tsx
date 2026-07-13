"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getAllEvents, exportEventsAsJson, exportEventsAsCsv, clearEvents } from "@/lib/analytics";
import { AnalyticsEvent } from "@/types";
import { formatQ } from "@/lib/utils";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PrototypeInsightsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    setEvents(getAllEvents());
  }, []);

  const sessions = new Set(events.map((e) => e.sessionId));
  const proposalSaves = events.filter((e) => e.eventName === "proposal_saved");
  const cartAdds = events.filter((e) => e.eventName === "add_to_cart");
  const checkoutCompletes = events.filter((e) => e.eventName === "checkout_completed");
  const smartCareSelections = events.filter((e) => e.eventName === "smart_care_selected");

  const productCounts: Record<string, number> = {};
  events
    .filter((e) => e.eventName === "plant_selected" && e.productId)
    .forEach((e) => {
      productCounts[e.productId!] = (productCounts[e.productId!] ?? 0) + 1;
    });
  const productChartData = Object.entries(productCounts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const routeCounts: Record<string, number> = {};
  events
    .filter((e) => e.eventName === "page_view")
    .forEach((e) => {
      routeCounts[e.route] = (routeCounts[e.route] ?? 0) + 1;
    });
  const routeChartData = Object.entries(routeCounts).map(([route, count]) => ({
    route,
    count,
  }));

  const avgCart =
    proposalSaves.length > 0
      ? proposalSaves.reduce((sum, e) => sum + (e.priceQ ?? 0), 0) / proposalSaves.length
      : 0;

  const pctReachedCart = sessions.size > 0 ? (cartAdds.length / sessions.size) * 100 : 0;
  const pctCheckout = sessions.size > 0 ? (checkoutCompletes.length / sessions.size) * 100 : 0;
  const pctSmartCare = sessions.size > 0 ? (smartCareSelections.length / sessions.size) * 100 : 0;

  return (
    <div className="container-app py-10">
      <span className="eyebrow">Panel interno</span>
      <h1 className="mt-3 font-serif text-3xl text-brand-forest">
        Insights de pruebas de producto
      </h1>
      <p className="mt-2 text-sm text-brand-carbon/60">
        Esta ruta no aparece en la navegación pública. Los datos provienen
        únicamente de este navegador.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Metric label="Sesiones" value={sessions.size.toString()} />
        <Metric label="Propuestas guardadas" value={proposalSaves.length.toString()} />
        <Metric label="Llegaron al carrito" value={`${pctReachedCart.toFixed(0)}%`} />
        <Metric label="Simularon checkout" value={`${pctCheckout.toFixed(0)}%`} />
        <Metric label="Interés en Smart Care" value={`${pctSmartCare.toFixed(0)}%`} />
      </div>

      <div className="mt-4 card-surface inline-block p-4">
        <p className="text-xs text-brand-carbon/55">Precio promedio de propuesta guardada</p>
        <p className="mt-1 font-serif text-2xl text-brand-forest">{formatQ(Math.round(avgCart))}</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="text-sm font-semibold text-brand-carbon">
            Plantas más seleccionadas
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E0D2" />
                <XAxis dataKey="id" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1F5E3B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5">
          <h2 className="text-sm font-semibold text-brand-carbon">
            Vistas por ruta
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E0D2" />
                <XAxis dataKey="route" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#5F8F68" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          onClick={() => download("verdea-events.json", exportEventsAsJson(), "application/json")}
          className="rounded-full border border-brand-beige bg-white px-4 py-2 text-xs font-medium text-brand-carbon/75"
        >
          Exportar JSON
        </button>
        <button
          onClick={() => download("verdea-events.csv", exportEventsAsCsv(), "text/csv")}
          className="rounded-full border border-brand-beige bg-white px-4 py-2 text-xs font-medium text-brand-carbon/75"
        >
          Exportar CSV
        </button>
        <button
          onClick={() => {
            clearEvents();
            setEvents([]);
          }}
          className="rounded-full border border-brand-beige bg-white px-4 py-2 text-xs font-medium text-red-500"
        >
          Limpiar datos locales
        </button>
      </div>

      <div className="mt-8 overflow-x-auto card-surface p-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-brand-carbon/50">
              <th className="py-2 pr-4">Timestamp</th>
              <th className="py-2 pr-4">Sesión</th>
              <th className="py-2 pr-4">Ruta</th>
              <th className="py-2 pr-4">Evento</th>
              <th className="py-2 pr-4">Producto</th>
              <th className="py-2 pr-4">Precio</th>
            </tr>
          </thead>
          <tbody>
            {events
              .slice(-50)
              .reverse()
              .map((e, i) => (
                <tr key={i} className="border-t border-brand-beige/50 text-brand-carbon/70">
                  <td className="py-1.5 pr-4">{new Date(e.timestamp).toLocaleTimeString("es-GT")}</td>
                  <td className="py-1.5 pr-4">{e.sessionId.slice(0, 10)}</td>
                  <td className="py-1.5 pr-4">{e.route}</td>
                  <td className="py-1.5 pr-4">{e.eventName}</td>
                  <td className="py-1.5 pr-4">{e.productId ?? "—"}</td>
                  <td className="py-1.5 pr-4">{e.priceQ ? formatQ(e.priceQ) : "—"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface p-4">
      <p className="text-xs text-brand-carbon/55">{label}</p>
      <p className="mt-1 font-serif text-2xl text-brand-forest">{value}</p>
    </div>
  );
}
