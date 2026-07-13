import { AiRecommendationSet } from "@/types";

// These are hand-authored "recommendation sets" that stand in for a real
// multimodal analysis. lib/ai-simulator.ts picks one based on the room
// type and answers the person gave. Replace this file's contents with
// real model output later without changing any component code.
export const aiRecommendationSets: AiRecommendationSet[] = [
  {
    id: "tropical-minimalista",
    matchesSpaceType: ["sala", "dormitorio"],
    matchesStyle: ["minimalista", "moderno"],
    summaryText:
      "Analicé la iluminación, el espacio disponible y el estilo de tu habitación. Te recomiendo una combinación tropical minimalista con plantas de fácil cuidado.",
    style: "Tropical minimalista",
    colorPalette: ["#1F5E3B", "#EAF3E8", "#B76E4D"],
    maintenanceLevel: "facil",
    estimatedBudgetQ: [280, 520],
    plantIds: ["monstera-joven", "pothos-golden", "peperomia-obtusifolia"],
    planterIds: ["ceramica-blanca-s", "barro-natural-m"],
    markers: [
      { x: 22, y: 68, label: "Rincón junto a la ventana" },
      { x: 68, y: 40, label: "Repisa con luz indirecta" },
      { x: 48, y: 82, label: "Piso junto al sofá" },
    ],
  },
  {
    id: "oficina-productiva",
    matchesSpaceType: ["oficina"],
    matchesStyle: ["moderno", "minimalista"],
    summaryText:
      "Tu oficina recibe luz media y tiene superficies despejadas. Elegí plantas que toleran aire acondicionado y bajo riego para que no dependan de ti todos los días.",
    style: "Oficina productiva",
    colorPalette: ["#5F8F68", "#F7F4ED", "#202421"],
    maintenanceLevel: "facil",
    estimatedBudgetQ: [220, 430],
    plantIds: ["zamioculca", "sansevieria", "aglaonema"],
    planterIds: ["cemento-gris-m", "ceramica-blanca-s"],
    markers: [
      { x: 30, y: 55, label: "Esquina del escritorio" },
      { x: 75, y: 30, label: "Estante superior" },
    ],
  },
  {
    id: "balcon-luminoso",
    matchesSpaceType: ["balcon", "exterior"],
    matchesStyle: ["natural", "bohemio"],
    summaryText:
      "Tu balcón recibe luz alta durante buena parte del día. Te propongo especies resistentes al sol directo y al viento, con macetas que toleran exteriores.",
    style: "Natural exterior",
    colorPalette: ["#B76E4D", "#E9E0D2", "#1F5E3B"],
    maintenanceLevel: "facil",
    estimatedBudgetQ: [180, 360],
    plantIds: ["aloe-vera", "cactus", "suculenta"],
    planterIds: ["cemento-gris-m", "barro-natural-s"],
    markers: [
      { x: 20, y: 70, label: "Barandal izquierdo" },
      { x: 60, y: 60, label: "Mesa lateral" },
    ],
  },
  {
    id: "poca-luz-bienestar",
    matchesSpaceType: ["dormitorio", "sala", "oficina", "comedor", "bano", "otro"],
    matchesStyle: ["cualquiera"],
    summaryText:
      "Detecté que tu espacio recibe poca luz natural. Elegí una combinación de especies tolerantes a sombra que igual aportan volumen y textura.",
    style: "Bienestar en sombra",
    colorPalette: ["#1F5E3B", "#F7F4ED", "#5F8F68"],
    maintenanceLevel: "facil",
    estimatedBudgetQ: [200, 400],
    plantIds: ["zamioculca", "aglaonema", "palma-salon"],
    planterIds: ["fibra-negra-m", "ceramica-blanca-s"],
    markers: [
      { x: 25, y: 60, label: "Rincón sin ventana directa" },
      { x: 70, y: 45, label: "Repisa interior" },
    ],
  },
];
