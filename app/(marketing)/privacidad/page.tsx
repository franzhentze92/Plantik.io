import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import { SITE_CONTACT } from "@/data/site";

export const metadata = {
  title: "Política de privacidad — Plantik",
  description: "Cómo Plantik recopila, usa y protege tu información personal.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-carbon">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-forest hover:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="max-w-3xl">
          <span className="eyebrow inline-flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5" />
            Legal
          </span>
          <h1 className="mt-3 font-serif text-4xl text-brand-forest">
            Política de privacidad
          </h1>
          <p className="mt-2 text-sm text-brand-carbon/55">
            Última actualización: julio 2026
          </p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-brand-carbon/70">
            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                1. Responsable
              </h2>
              <p className="mt-2">
                Plantik (&ldquo;nosotros&rdquo;) opera desde Guatemala. Para
                consultas sobre privacidad puedes contactarnos en{" "}
                <a
                  href={SITE_CONTACT.emailHref}
                  className="font-medium text-brand-forest hover:opacity-70"
                >
                  {SITE_CONTACT.email}
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                2. Datos que recopilamos
              </h2>
              <ul className="mt-2 list-inside list-disc space-y-1.5">
                <li>
                  <strong className="font-medium text-brand-carbon">Cuenta:</strong>{" "}
                  nombre, correo electrónico y contraseña (almacenada de forma segura).
                </li>
                <li>
                  <strong className="font-medium text-brand-carbon">Uso del servicio:</strong>{" "}
                  fotos que subes, preferencias de diseño, propuestas guardadas y
                  actividad en el catálogo.
                </li>
                <li>
                  <strong className="font-medium text-brand-carbon">Compras:</strong>{" "}
                  datos de pedido, dirección de entrega y método de pago (procesados
                  por proveedores de pago certificados).
                </li>
                <li>
                  <strong className="font-medium text-brand-carbon">Técnicos:</strong>{" "}
                  tipo de dispositivo, navegador y datos de uso anónimos para mejorar
                  la plataforma.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                3. Cómo usamos tus datos
              </h2>
              <p className="mt-2">
                Utilizamos tu información para operar Plantik, generar recomendaciones
                personalizadas, procesar pedidos, responder soporte, enviar
                comunicaciones relacionadas con tu cuenta y mejorar nuestros
                productos. No vendemos tu información personal a terceros.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                4. Compartir información
              </h2>
              <p className="mt-2">
                Podemos compartir datos con proveedores que nos ayudan a operar el
                servicio (hosting, pagos, envíos, análisis), siempre bajo obligaciones
                de confidencialidad. También cuando la ley lo exija o para proteger
                nuestros derechos y los de nuestros usuarios.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                5. Fotos y contenido
              </h2>
              <p className="mt-2">
                Las imágenes de tu espacio se procesan para generar propuestas.
                No las usamos con fines publicitarios sin tu consentimiento explícito.
                Puedes solicitar la eliminación de contenido asociado a tu cuenta.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                6. Cookies y almacenamiento local
              </h2>
              <p className="mt-2">
                Usamos cookies y almacenamiento local para mantener tu sesión,
                recordar preferencias y medir el uso del sitio. Puedes configurar
                tu navegador para limitar cookies, aunque algunas funciones podrían
                dejar de estar disponibles.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                7. Tus derechos
              </h2>
              <p className="mt-2">
                Puedes acceder, corregir o solicitar la eliminación de tus datos
                personales escribiendo a{" "}
                <a
                  href={SITE_CONTACT.emailHref}
                  className="font-medium text-brand-forest hover:opacity-70"
                >
                  {SITE_CONTACT.email}
                </a>
                . Responderemos en un plazo razonable conforme a la legislación
                aplicable.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                8. Seguridad y cambios
              </h2>
              <p className="mt-2">
                Aplicamos medidas técnicas y organizativas para proteger tu
                información. Esta política puede actualizarse; publicaremos la
                versión vigente en esta página con la fecha de revisión.
              </p>
            </section>
          </div>

          <p className="mt-12 text-sm text-brand-carbon/50">
            Consulta también nuestros{" "}
            <Link href="/terminos" className="font-medium text-brand-forest hover:opacity-70">
              términos de uso
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
