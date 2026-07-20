import Image from "next/image";
import Link from "next/link";
import { formatQ } from "@/lib/utils";
import { ACCESSORY_ICONS } from "@/lib/accessory-icons";
import type { RelatedGroup, RelatedItem } from "@/lib/recommendations/related-products";

export function ProductRecommendations({ groups }: { groups: RelatedGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <div className="mt-14 space-y-12">
      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="font-serif text-2xl text-brand-forest">{group.title}</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {group.items.map((item) => (
              <RecommendationCard key={item.key} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function RecommendationCard({ item }: { item: RelatedItem }) {
  // Catalog studio photos and accessory shots sit on white backgrounds, so we
  // contain them. Curated lifestyle photos fill the frame.
  const useContain = item.useContain || item.kind === "accessory";
  const Icon = item.iconKey ? ACCESSORY_ICONS[item.iconKey] : null;

  return (
    <Link
      href={item.href}
      className="card-surface group overflow-hidden transition-shadow hover:shadow-card"
    >
      <div
        className={`relative h-28 w-full ${item.image && useContain ? "bg-white" : ""}`}
        style={!item.image ? { backgroundColor: item.swatch } : undefined}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={`${useContain ? "object-contain p-2" : "object-cover"} transition-transform duration-300 group-hover:scale-105`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 ring-1 ring-black/5">
              {Icon ? <Icon className="h-5 w-5 text-brand-carbon/70" /> : null}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-xs font-semibold text-brand-carbon">
          {item.name}
        </p>
        <p className="mt-1 text-xs text-brand-forest">{formatQ(item.priceQ)}</p>
      </div>
    </Link>
  );
}
