import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import { SITE_CONTACT } from "@/data/site";

export const metadata = {
  title: "Términos de uso — Plantik",
  description: "Términos y condiciones de uso de la plataforma Plantik.",
};

export default function TermsPage() {
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
            Términos de uso
          </h1>
          <p className="mt-2 text-sm text-brand-carbon/55">
            Última actualización: julio 2026
          </p>

          <div className="prose-verdea mt-10 space-y-8 text-sm leading-relaxed text-brand-carbon/70">
            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                1. Aceptación
              </h2>
              <p className="mt-2">
                Al acceder o usar Plantik —incluyendo nuestro sitio web, catálogo,
                herramientas de diseño y plataforma— aceptas estos términos. Si
                no estás de acuerdo, no utilices el servicio.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                2. El servicio
              </h2>
              <p className="mt-2">
                Plantik ofrece recomendaciones de plantas y productos relacionados
                a partir de la información que proporcionas (fotos, preferencias,
                espacio). Las sugerencias son orientativas y no sustituyen asesoría
                profesional en jardinería, arquitectura o construcción.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                3. Cuenta de usuario
              </h2>
              <p className="mt-2">
                Eres responsable de mantener la confidencialidad de tus credenciales
                y de toda actividad en tu cuenta. Debes proporcionar información
                veraz al registrarte y notificarnos ante cualquier uso no autorizado.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                4. Compras y catálogo
              </h2>
              <p className="mt-2">
                Los precios, disponibilidad y descripciones de productos pueden
                cambiar sin previo aviso. Una compra se confirma cuando recibes
                la confirmación correspondiente. Nos reservamos el derecho de
                cancelar pedidos por errores evidentes de precio o stock.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                5. Contenido que subes
              </h2>
              <p className="mt-2">
                Al subir fotos o contenido a Plantik, nos concedes una licencia
                limitada para procesarlo y generar recomendaciones. Conservas la
                propiedad de tu contenido. No debes subir material que infrinja
                derechos de terceros ni contenido ilegal u ofensivo.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                6. Uso permitido
              </h2>
              <p className="mt-2">
                No está permitido usar Plantik para fines ilícitos, intentar
                acceder sin autorización a nuestros sistemas, extraer datos de
                forma automatizada sin permiso, ni reproducir el servicio con fines
                comerciales no autorizados.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                7. Limitación de responsabilidad
              </h2>
              <p className="mt-2">
                Plantik se ofrece &ldquo;tal cual&rdquo;. No garantizamos resultados
                específicos en el crecimiento de plantas ni en la decoración de
                espacios. En la medida permitida por la ley, no seremos responsables
                por daños indirectos derivados del uso del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-brand-carbon">
                8. Cambios y contacto
              </h2>
              <p className="mt-2">
                Podemos actualizar estos términos publicando una nueva versión en
                esta página. Para dudas, escríbenos a{" "}
                <a
                  href={SITE_CONTACT.emailHref}
                  className="font-medium text-brand-forest hover:opacity-70"
                >
                  {SITE_CONTACT.email}
                </a>
                .
              </p>
            </section>
          </div>

          <p className="mt-12 text-sm text-brand-carbon/50">
            Consulta también nuestra{" "}
            <Link href="/privacidad" className="font-medium text-brand-forest hover:opacity-70">
              política de privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
