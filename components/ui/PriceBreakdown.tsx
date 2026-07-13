import { formatQ } from "@/lib/utils";

export function PriceBreakdown({
  lines,
  total,
}: {
  lines: { label: string; amountQ: number }[];
  total: number;
}) {
  return (
    <div className="space-y-2 text-sm">
      {lines.map((line) => (
        <div key={line.label} className="flex justify-between text-brand-carbon/70">
          <span>{line.label}</span>
          <span>{formatQ(line.amountQ)}</span>
        </div>
      ))}
      <div className="mt-2 flex justify-between border-t border-brand-beige pt-2 text-sm font-semibold text-brand-forest">
        <span>Total estimado</span>
        <span>{formatQ(total)}</span>
      </div>
    </div>
  );
}
