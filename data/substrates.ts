export interface Substrate {
  id: string;
  name: string;
  description: string;
  priceQ: number;
}

export const substrates: Substrate[] = [
  { id: "estandar", name: "Estándar", description: "Mezcla balanceada para la mayoría de plantas de interior.", priceQ: 0 },
  { id: "tropical", name: "Tropical", description: "Alta retención de humedad para especies tropicales.", priceQ: 15 },
  { id: "suculentas", name: "Suculentas y cactus", description: "Drenaje rápido para especies de bajo riego.", priceQ: 15 },
  { id: "alta-aireacion", name: "Alta aireación", description: "Ideal para raíces sensibles al encharcamiento.", priceQ: 20 },
  { id: "alta-retencion", name: "Alta retención", description: "Para especies que requieren humedad constante.", priceQ: 20 },
  { id: "premium", name: "Premium", description: "Mezcla enriquecida con nutrientes de liberación lenta.", priceQ: 35 },
];
