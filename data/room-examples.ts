import { RoomExample } from "@/types";

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

export const roomExamples: RoomExample[] = [
  {
    id: "sala-luminosa",
    label: "Sala luminosa",
    spaceType: "sala",
    image: img("photo-1615873968403-89e068629265"),
  },
  {
    id: "dormitorio-nordico",
    label: "Dormitorio nórdico",
    spaceType: "dormitorio",
    image: img("photo-1522771739844-6a9f6d5f14af"),
  },
  {
    id: "oficina-minimal",
    label: "Oficina minimalista",
    spaceType: "oficina",
    image: img("photo-1593642702821-c8da6771f0c6"),
  },
  {
    id: "balcon-verde",
    label: "Balcón con luz natural",
    spaceType: "balcon",
    image: img("photo-1598300042247-d088f8ab3a91"),
  },
];
