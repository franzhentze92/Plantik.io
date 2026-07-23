import { Eye, Leaf, MapPin } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Elige los puntos",
    description: "Marca dónde quieres cada planta.",
  },
  {
    icon: Leaf,
    title: "Arma tu combinación",
    description: "Planta, maceta y plato a tu gusto.",
  },
  {
    icon: Eye,
    title: "Visualiza tu espacio",
    description: "Plantik genera cómo lucirá tu foto.",
  },
];

export function SpaceDesignFeatures() {
  return (
    <div className="grid shrink-0 grid-cols-3 gap-3 border-t border-brand-beige/60 pt-4">
      {features.map((f) => {
        const Icon = f.icon;
        return (
          <div key={f.title} className="text-center">
            <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
              <Icon className="h-4 w-4" />
            </span>
            <h3 className="mt-1.5 text-[11px] font-semibold leading-tight text-brand-forest">
              {f.title}
            </h3>
            <p className="mt-0.5 text-[10px] leading-snug text-brand-carbon/55">
              {f.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
