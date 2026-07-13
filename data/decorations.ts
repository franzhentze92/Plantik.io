import { Decoration } from "@/types";

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=600&q=80`;

export const decorations: Decoration[] = [
  { id: "piedra-clara", name: "Piedras claras", category: "acabado", priceQ: 15, image: img("photo-1500534623283-312aade485b7") },
  { id: "piedra-oscura", name: "Piedras oscuras", category: "acabado", priceQ: 15, image: img("photo-1500534623283-312aade485b7") },
  { id: "corteza", name: "Corteza decorativa", category: "acabado", priceQ: 18, image: img("photo-1441974231531-c6227db76b6e") },
  { id: "musgo", name: "Musgo decorativo", category: "acabado", priceQ: 20, image: img("photo-1441974231531-c6227db76b6e") },
  { id: "cubremaceta", name: "Cubremaceta", category: "accesorio", priceQ: 45, image: img("photo-1493552832879-84c26d240b32") },
  { id: "plato", name: "Plato de drenaje", category: "accesorio", priceQ: 25, image: img("photo-1485955900006-10f4d324d411") },
  { id: "soporte", name: "Soporte elevador", category: "accesorio", priceQ: 65, image: img("photo-1517430816045-df4b7de4d63b") },
  { id: "etiqueta", name: "Etiqueta personalizada", category: "detalle", priceQ: 10, image: img("photo-1441974231531-c6227db76b6e") },
  { id: "tarjeta-regalo", name: "Tarjeta de regalo", category: "detalle", priceQ: 8, image: img("photo-1441974231531-c6227db76b6e") },
];

export const getDecorationById = (id: string) => decorations.find((d) => d.id === id);
