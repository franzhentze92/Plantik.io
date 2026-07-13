"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DesignResultsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app/disena-tu-espacio");
  }, [router]);

  return (
    <div className="container-app py-16">
      <p className="text-brand-carbon/60">Redirigiendo...</p>
    </div>
  );
}
