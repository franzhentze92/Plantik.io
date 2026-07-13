import { PackageItem } from "@/types";

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=900&q=80`;

// Prices are for validation only — adjust freely without touching UI code.
export const packages: PackageItem[] = [
  {
    id: "planta-lista",
    slug: "planta-lista",
    name: "Planta Lista",
    tagline: "La forma más simple de empezar.",
    includes: ["Planta", "Maceta básica", "Sustrato", "Trasplante"],
    fromPriceQ: 149,
    image: img("photo-1611211232932-da3113c5b8a3"),
    smartCare: false,
  },
  {
    id: "deco-plant",
    slug: "deco-plant",
    name: "Deco Plant",
    tagline: "Cuando el estilo importa tanto como la planta.",
    includes: ["Planta", "Maceta decorativa", "Sustrato especializado", "Acabado decorativo"],
    fromPriceQ: 249,
    image: img("photo-1493552832879-84c26d240b32"),
    smartCare: false,
  },
  {
    id: "smart-plant-upgrade",
    slug: "smart-plant-upgrade",
    name: "Smart Plant Upgrade",
    tagline: "Convierte una planta actual en una planta inteligente.",
    includes: ["Planta o adaptación existente", "Smart Adapter", "Monitoreo", "Preparación para Tank Hub"],
    fromPriceQ: 399,
    image: img("photo-1585152968992-d2b9444408cc"),
    smartCare: true,
  },
  {
    id: "copilot-home",
    slug: "copilot-home",
    name: "Copilot Home",
    tagline: "El ecosistema completo con voz y chat.",
    includes: ["Diseño del espacio", "Copilot Pot", "Tank Hub", "Adaptadores", "Instalación y configuración"],
    fromPriceQ: 999,
    image: img("photo-1519336056116-bc0f1771dec8"),
    smartCare: true,
  },
];

export const getPackageBySlug = (slug: string) => packages.find((p) => p.slug === slug);
