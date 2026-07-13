import { Testimonial } from "@/types";

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=200&q=80`;

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Andrea Solís",
    role: "Diseñadora de interiores",
    quote:
      "Subí una foto de mi sala y en segundos tenía tres combinaciones que realmente encajaban con la luz del espacio.",
    avatar: img("photo-1544005313-94ddf0286df2"),
  },
  {
    id: "t2",
    name: "Marco Estrada",
    role: "Trabaja desde casa",
    quote:
      "Cada planta indica su nivel de luz y cuidado, así elegí unas que sí sobreviven en mi oficina.",
    avatar: img("photo-1500648767791-00dcc994a43e"),
  },
  {
    id: "t3",
    name: "Fernanda López",
    role: "Nueva en el mundo de las plantas",
    quote:
      "Armar mi planta paso a paso se sintió tan fácil como pedir comida por internet.",
    avatar: img("photo-1531123897727-8f129e1688ce"),
  },
];
