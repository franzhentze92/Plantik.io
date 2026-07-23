export function AuthProviderDivider({ label = "o continúa con" }: { label?: string }) {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-brand-beige" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-xs text-brand-carbon/45">{label}</span>
      </div>
    </div>
  );
}
