import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-surface flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="font-serif text-xl text-brand-forest">{title}</h3>
      <p className="max-w-sm text-sm text-brand-carbon/65">{description}</p>
      {action}
    </div>
  );
}
