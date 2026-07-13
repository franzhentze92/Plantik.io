import { SmartCareProduct } from "@/types";

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=800&q=80`;

export const smartCareProducts: SmartCareProduct[] = [
  {
    id: "smart-adapter",
    name: "Smart Adapter",
    description: "Convierte cualquier maceta existente en parte del sistema Smart Care.",
    priceQ: 149,
    features: ["Sensor de humedad", "Tubo discreto", "Gotero de precisión", "Historial de riego", "Alertas"],
    image: img("photo-1585152968992-d2b9444408cc"),
  },
  {
    id: "tank-hub",
    name: "Tank Hub",
    description: "Tanque central que distribuye agua y nutrientes a varias plantas conectadas.",
    priceQ: 349,
    features: ["Riego secuencial", "Sensor de nivel", "Control de flujo", "Detección de fugas"],
    image: img("photo-1591129841117-3adfd313e34f"),
  },
  {
    id: "nutrition-ab",
    name: "Nutrition A/B",
    description: "Dos cartuchos de nutrientes con dosificación automática individual.",
    priceQ: 129,
    features: ["Cartucho A y B", "Dosificación automática", "Aplicación individual", "Lavado de líneas"],
    image: img("photo-1585155770447-2f66e2a397b5"),
  },
  {
    id: "copilot-pot",
    name: "Copilot Pot",
    description: "Maceta principal con voz, chat y una cara animada que resume el estado de todas tus plantas.",
    priceQ: 599,
    features: ["Cara animada", "Voz y chat", "Resumen de plantas", "Control de riego y nutrición"],
    image: img("photo-1519336056116-bc0f1771dec8"),
  },
];

export const getSmartCareById = (id: string) => smartCareProducts.find((s) => s.id === id);
