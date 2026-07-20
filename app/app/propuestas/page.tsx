"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getProposalsBySessionId,
  deleteProposal as deleteProposalFromDb,
  createProposal,
  Proposal,
} from "@/lib/supabase/proposals";
import { getOrCreateSessionId } from "@/lib/session";
import { formatQ } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { groupSavedBySection, SAVED_SECTIONS } from "@/lib/saved-sections";
import { ACCESSORY_ICONS } from "@/lib/accessory-icons";
import { useCartStore, useCreationsStore, SavedPlant, useSavedStore } from "@/lib/store";
import { CreationThumbnail } from "@/components/creations/CreationThumbnail";
import {
  BookMarked,
  Copy,
  Layers,
  Leaf,
  Moon,
  ShoppingCart,
  Sun,
  SunMedium,
  Trash2,
  X,
} from "lucide-react";

const statusLabel: Record<string, string> = {
  draft: "Borrador",
  completed: "Lista",
};

const LIGHT_META: Record<string, { icon: typeof Sun; label: string }> = {
  baja: { icon: Moon, label: "Luz baja" },
  media: { icon: SunMedium, label: "Luz media" },
  alta: { icon: Sun, label: "Luz alta" },
};

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const savedPlants = useSavedStore((s) => s.saved);
  const removeSaved = useSavedStore((s) => s.remove);
  const clearSaved = useSavedStore((s) => s.clear);
  const creations = useCreationsStore((s) => s.creations);
  const removeCreation = useCreationsStore((s) => s.remove);
  const addToCart = useCartStore((s) => s.add);

  function buyProposal() {
    savedPlants.forEach((p) =>
      addToCart({
        id: p.id,
        kind: p.kind ?? "plant",
        name: p.name,
        subtitle: p.subtitle ?? p.scientificName,
        image: p.image,
        priceQ: p.priceQ,
      })
    );
    router.push("/app/carrito");
  }

  useEffect(() => {
    setMounted(true);
    track("page_view", { route: "/app/propuestas" });

    async function loadProposals() {
      try {
        const sessionId = getOrCreateSessionId();
        const data = await getProposalsBySessionId(sessionId);
        setProposals(data);
      } catch (err) {
        console.error("Error loading proposals:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProposals();
  }, []);

  async function handleDelete(id: string) {
    try {
      await deleteProposalFromDb(id);
      setProposals((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting proposal:", err);
    }
  }

  async function handleDuplicate(proposal: Proposal) {
    try {
      const copy = await createProposal(
        getOrCreateSessionId(),
        proposal.space_id || "",
        proposal.analysis_id || "",
        proposal.items,
        `${proposal.name} (copia)`
      );
      setProposals((prev) => [copy, ...prev]);
    } catch (err) {
      console.error("Error duplicating proposal:", err);
    }
  }

  const savedTotal = savedPlants.reduce((sum, p) => sum + p.priceQ, 0);
  const savedBySection = groupSavedBySection(savedPlants);
  const hasSavedProducts = savedPlants.length > 0;
  const isEmpty =
    mounted &&
    !loading &&
    savedPlants.length === 0 &&
    creations.length === 0 &&
    proposals.length === 0;

  if (!mounted || loading) {
    return (
      <div className="container-app py-16">
        <p className="text-brand-carbon/60">Cargando...</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="container-app py-12">
        <PageHeader count={0} />
        <EmptyProposals />
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <PageHeader
        count={savedPlants.length + creations.length + proposals.length}
      />

      {creations.length > 0 && (
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-xl text-brand-forest">
              Mis creaciones
            </h2>
            <Link
              href="/app/arma-tu-planta"
              className="inline-flex items-center gap-2 rounded-full border border-brand-forest/30 bg-white px-4 py-2 text-xs font-semibold text-brand-forest transition-colors hover:bg-brand-sage/50"
            >
              <Layers className="h-3.5 w-3.5" />
              Armar otra
            </Link>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {creations.map((creation) => (
              <div
                key={creation.id}
                className="card-surface group relative overflow-hidden"
              >
                <button
                  type="button"
                  aria-label="Eliminar creación"
                  onClick={() => removeCreation(creation.id)}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-carbon/60 shadow-soft backdrop-blur transition-colors hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>

                <Link href={`/app/creaciones/${creation.id}`} className="block">
                  <div className="relative h-40 w-full overflow-hidden">
                    <CreationThumbnail
                      className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                      fallbackImage={creation.image}
                      pieces={creation.components.map((c) => ({
                        label: c.label,
                        image: c.image,
                      }))}
                    />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-forest/90 px-2.5 py-1 text-[10px] font-semibold text-white">
                      <Layers className="h-3 w-3" />
                      Creación
                    </span>
                  </div>

                  <div className="p-4 pb-2">
                    <h3 className="text-sm font-semibold text-brand-carbon">
                      {creation.name}
                    </h3>
                    <ul className="mt-2 space-y-0.5">
                      {creation.components.map((c, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between text-[11px] text-brand-carbon/55"
                        >
                          <span>{c.label}</span>
                          <span className="truncate pl-2 text-brand-carbon/75">
                            {c.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>

                <div className="flex items-center justify-between px-4 pb-4">
                  <span className="text-sm font-semibold text-brand-forest">
                    {formatQ(creation.totalQ)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      addToCart({
                        id: creation.id,
                        kind: "creacion",
                        name: creation.name,
                        subtitle: creation.components
                          .map((c) => c.name)
                          .slice(0, 2)
                          .join(" + "),
                        image: creation.image,
                        priceQ: creation.totalQ,
                        components: creation.components,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-forest px-3.5 py-1.5 text-[11px] font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    Al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasSavedProducts && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-brand-beige/70 bg-white/60 px-5 py-4">
          <p className="text-sm text-brand-carbon/65">
            <span className="font-semibold text-brand-forest">
              {savedPlants.length} producto{savedPlants.length !== 1 ? "s" : ""}
            </span>{" "}
            guardado{savedPlants.length !== 1 ? "s" : ""} · {formatQ(savedTotal)}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearSaved}
              className="text-xs font-medium text-brand-carbon/55 transition-colors hover:text-brand-forest"
            >
              Vaciar productos
            </button>
            <button
              type="button"
              onClick={buyProposal}
              className="inline-flex items-center gap-2 rounded-full bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
            >
              <ShoppingCart className="h-4 w-4" />
              Comprar todo · {formatQ(savedTotal)}
            </button>
          </div>
        </div>
      )}

      {SAVED_SECTIONS.map(({ key, title }) => {
        const items = savedBySection[key];
        if (!items?.length) return null;

        return (
          <section key={key} className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-xl text-brand-forest">{title}</h2>
              <span className="text-xs text-brand-carbon/50">
                {items.length} artículo{items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
                <SavedProductCard
                  key={item.id}
                  item={item}
                  onRemove={() => removeSaved(item.id)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {proposals.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-xl text-brand-forest">
            Propuestas de diseño
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {proposals.map((proposal) => (
              <Link
                key={proposal.id}
                href={`/app/propuestas/${proposal.id}`}
                className="card-surface block overflow-hidden transition-shadow hover:shadow-card"
              >
                <div className="relative h-36 w-full bg-brand-cream">
                  <Image
                    src={proposal.generated_image_url || "/images/plant-placeholder.svg"}
                    alt={proposal.name || "Propuesta"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-brand-carbon">
                      {proposal.name}
                    </h3>
                    <span className="rounded-full bg-brand-sage px-2 py-0.5 text-[10px] font-semibold text-brand-forest">
                      {statusLabel[proposal.status] || proposal.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-brand-carbon/50">
                    {new Date(proposal.created_at).toLocaleDateString("es-GT")} ·{" "}
                    {proposal.items.length} planta
                    {proposal.items.length !== 1 ? "s" : ""}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-brand-forest">
                    {formatQ(proposal.total_price_q || 0)}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDuplicate(proposal);
                      }}
                      className="flex items-center gap-1 rounded-full border border-brand-beige bg-white px-3 py-1.5 text-[11px] font-medium text-brand-carbon/70"
                    >
                      <Copy className="h-3 w-3" /> Duplicar
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(proposal.id);
                      }}
                      className="ml-auto flex items-center gap-1 rounded-full border border-brand-beige bg-white px-3 py-1.5 text-[11px] font-medium text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SavedProductCard({
  item,
  onRemove,
}: {
  item: SavedPlant;
  onRemove: () => void;
}) {
  const light = item.light ? LIGHT_META[item.light] : null;
  const LightIcon = light?.icon;
  const href =
    item.href ??
    (item.kind === "planter"
      ? `/app/macetas/${item.id}`
      : item.kind === "accesorio"
        ? `/app/accesorios/${item.id}`
        : `/app/plantas/${item.id}`);
  const subtitle = item.scientificName ?? item.subtitle;
  const isAccessory = item.kind === "accesorio";
  const AccessoryIcon =
    item.iconKey && item.iconKey in ACCESSORY_ICONS
      ? ACCESSORY_ICONS[item.iconKey as keyof typeof ACCESSORY_ICONS]
      : null;

  return (
    <div className="card-surface group relative overflow-hidden">
      <button
        type="button"
        aria-label="Quitar de mis propuestas"
        onClick={onRemove}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-carbon/60 shadow-soft backdrop-blur transition-colors hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </button>

      <Link href={href} className="block">
        {isAccessory && !item.image && item.swatch ? (
          <div
            className="relative flex h-40 w-full items-center justify-center overflow-hidden"
            style={{ backgroundColor: item.swatch }}
          >
            {AccessoryIcon && (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/70 shadow-soft ring-1 ring-black/5 backdrop-blur transition-transform duration-300 group-hover:scale-110">
                <AccessoryIcon className="h-7 w-7 text-brand-carbon/70" />
              </span>
            )}
            {subtitle && (
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-brand-forest">
                {subtitle}
              </span>
            )}
          </div>
        ) : (
          <div
            className={`relative h-40 w-full overflow-hidden ${
              item.kind === "planter" || isAccessory
                ? "bg-white"
                : "bg-brand-cream"
            }`}
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              className={`${
                item.kind === "planter" || isAccessory
                  ? "object-contain p-3"
                  : "object-cover"
              } transition-transform duration-300 group-hover:scale-105`}
            />
            {item.kind === "planter" && (
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-brand-forest">
                Maceta
              </span>
            )}
            {isAccessory && subtitle && (
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-brand-forest">
                {subtitle}
              </span>
            )}
          </div>
        )}

        <div className="p-4">
          <h3 className="text-sm font-semibold text-brand-carbon">{item.name}</h3>
          {subtitle && !isAccessory && (
            <p className="text-xs italic text-brand-carbon/50">{subtitle}</p>
          )}
          {isAccessory && !item.swatch && subtitle && (
            <p className="text-xs text-brand-carbon/50">{subtitle}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-forest">
              {formatQ(item.priceQ)}
            </span>
            {light && LightIcon && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-sage px-2.5 py-1 text-[11px] font-medium text-brand-forest">
                <LightIcon className="h-3 w-3" />
                {light.label}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

function PageHeader({ count }: { count: number }) {
  return (
    <div>
      <span className="eyebrow inline-flex items-center gap-2">
        <Leaf className="h-3.5 w-3.5" />
        Mis propuestas
        <Leaf className="h-3.5 w-3.5" />
      </span>
      <h1 className="mt-3 font-serif text-4xl text-brand-forest sm:text-5xl">
        Tus propuestas guardadas
      </h1>
      <p className="mt-2 text-sm text-brand-carbon/65">
        {count > 0
          ? `Tienes ${count} elemento${count !== 1 ? "s" : ""} guardado${
              count !== 1 ? "s" : ""
            }.`
          : "Guarda plantas y diseños para volver a ellos cuando quieras."}
      </p>
    </div>
  );
}

function EmptyProposals() {
  return (
    <div className="relative mt-8 overflow-hidden rounded-xl2">
      {/* Soft botanical decoration */}
      <Leaf className="pointer-events-none absolute -left-6 top-8 h-40 w-40 -rotate-12 text-brand-moss/10" />
      <Leaf className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rotate-45 text-brand-moss/10" />
      <Leaf className="pointer-events-none absolute right-10 top-4 h-24 w-24 rotate-12 text-brand-moss/10" />
      <div className="pointer-events-none absolute -right-10 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brand-moss/10 blur-3xl" />

      <div className="relative grid items-center gap-8 rounded-xl2 border border-brand-beige/70 bg-white/70 p-8 shadow-card backdrop-blur lg:grid-cols-2 lg:p-12">
        <div className="text-center lg:text-left">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-sage text-brand-forest lg:mx-0">
            <BookMarked className="h-7 w-7" />
          </span>
          <h3 className="mt-5 font-serif text-2xl text-brand-forest">
            Aún no tienes propuestas guardadas
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-brand-carbon/65 lg:mx-0">
            Guarda tus plantas favoritas desde el catálogo o diseña tu espacio
            para crear tu primera propuesta.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
            <Link
              href="/app/disena-tu-espacio"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
            >
              Diseñar mi espacio
              <Leaf className="h-4 w-4" />
            </Link>
            <Link
              href="/app/plantas"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-forest/30 bg-white px-6 py-3 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-sage/60"
            >
              Explorar catálogo
            </Link>
          </div>
        </div>

        <div className="relative hidden h-64 overflow-hidden rounded-xl2 shadow-card lg:block">
          <Image
            src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80"
            alt="Sala con plantas"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-forest/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}
