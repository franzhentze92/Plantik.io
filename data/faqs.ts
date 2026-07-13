export type FaqIconKey =
  | "banknote"
  | "bookmark"
  | "camera"
  | "cpu"
  | "credit-card"
  | "droplets"
  | "heart-pulse"
  | "layers"
  | "layout-grid"
  | "leaf"
  | "package"
  | "paw-print"
  | "pencil-line"
  | "share"
  | "shield-check"
  | "shopping-cart"
  | "sparkles"
  | "sprout"
  | "sun"
  | "truck"
  | "upload"
  | "user"
  | "wifi";

export interface Faq {
  iconKey: FaqIconKey;
  q: string;
  a: string;
}

export interface FaqCategory {
  id: string;
  label: string;
  iconKey: FaqIconKey;
  faqs: Faq[];
}

export const FAQ_ALL_CATEGORY_ID = "todas";

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "espacio",
    label: "Tu espacio y recomendaciones",
    iconKey: "camera",
    faqs: [
      {
        iconKey: "camera",
        q: "¿Cómo funciona el análisis de mi espacio?",
        a: "Subes una fotografía de tu ambiente y Plantik identifica el nivel de iluminación, el estilo decorativo y las ubicaciones posibles para recomendarte plantas que realmente encajan ahí.",
      },
      {
        iconKey: "sparkles",
        q: "¿Qué tan precisas son las recomendaciones?",
        a: "Cada planta se evalúa según la luz detectada, el mantenimiento que buscas y si tienes mascotas. Verás una lista ordenada por compatibilidad, con el motivo de cada sugerencia.",
      },
      {
        iconKey: "upload",
        q: "¿Necesito subir una foto para recibir recomendaciones?",
        a: "La foto da los mejores resultados, pero también puedes responder unas preguntas rápidas sobre tu espacio y recibir una propuesta basada en tus respuestas.",
      },
      {
        iconKey: "layout-grid",
        q: "¿Puedo diseñar más de un espacio?",
        a: "Sí. Puedes crear tantas propuestas como ambientes tengas (sala, oficina, dormitorio) y guardarlas por separado en Mis propuestas.",
      },
    ],
  },
  {
    id: "propuestas",
    label: "Propuestas y diseño",
    iconKey: "pencil-line",
    faqs: [
      {
        iconKey: "pencil-line",
        q: "¿Puedo cambiar mi propuesta después de guardarla?",
        a: "Claro. Todas tus propuestas quedan en la sección Mis propuestas, donde puedes editarlas, duplicarlas o eliminarlas cuando quieras.",
      },
      {
        iconKey: "share",
        q: "¿Cómo comparto una propuesta?",
        a: "Desde el detalle de cada propuesta puedes revisarla y llevar sus plantas directo al carrito para completar la compra en un paso.",
      },
      {
        iconKey: "layers",
        q: "¿Puedo armar mi propia combinación de planta y maceta?",
        a: "Sí, con Arma tu planta eliges la planta, la maceta, el sustrato y los detalles decorativos, y el precio se calcula automáticamente mientras diseñas.",
      },
      {
        iconKey: "bookmark",
        q: "¿Las propuestas tienen costo?",
        a: "No. Diseñar espacios, guardar plantas y crear propuestas es gratis. Solo pagas los productos cuando decides comprarlos.",
      },
    ],
  },
  {
    id: "compras",
    label: "Compras y pagos",
    iconKey: "credit-card",
    faqs: [
      {
        iconKey: "credit-card",
        q: "¿Qué métodos de pago aceptan?",
        a: "Aceptamos pago con tarjeta de crédito y débito al finalizar tu pedido de forma segura desde el carrito.",
      },
      {
        iconKey: "shopping-cart",
        q: "¿Puedo cambiar la cantidad antes de pagar?",
        a: "Sí. En la página del producto eliges la cantidad y, dentro del carrito, puedes aumentarla o reducirla antes de confirmar el pago.",
      },
      {
        iconKey: "package",
        q: "¿Los precios incluyen la maceta?",
        a: "El precio de cada planta corresponde a la planta en su maceta de cultivo. Las macetas decorativas y accesorios se agregan por separado o al armar tu planta.",
      },
      {
        iconKey: "sprout",
        q: "¿Puedo agregar accesorios y sustratos a mi pedido?",
        a: "Por supuesto. En el catálogo encuentras platos, sustratos y cubiertas para maceta que puedes sumar al carrito junto con tus plantas y macetas.",
      },
    ],
  },
  {
    id: "envios",
    label: "Envíos y entregas",
    iconKey: "truck",
    faqs: [
      {
        iconKey: "truck",
        q: "¿Plantik entrega plantas fuera de la ciudad?",
        a: "La cobertura de entrega se define por departamento y municipio al momento de finalizar tu pedido, donde verás si tu dirección está dentro del área de reparto.",
      },
      {
        iconKey: "banknote",
        q: "¿Cuál es el costo de envío?",
        a: "El envío tiene una tarifa única de Q35 por pedido, que se suma automáticamente en el resumen del carrito.",
      },
      {
        iconKey: "shield-check",
        q: "¿Cómo se aseguran de que las plantas lleguen sanas?",
        a: "Cada planta se prepara y embala para el traslado, protegiendo hojas y sustrato para que llegue en las mejores condiciones a tu puerta.",
      },
    ],
  },
  {
    id: "smart-care",
    label: "Smart Care",
    iconKey: "wifi",
    faqs: [
      {
        iconKey: "wifi",
        q: "¿Qué es Smart Care?",
        a: "Es un conjunto de accesorios inteligentes — Smart Adapter, Tank Hub, Nutrition A/B y Copilot Pot — que automatizan el riego y la nutrición de tus plantas.",
      },
      {
        iconKey: "cpu",
        q: "¿Qué incluye el sistema Smart Care?",
        a: "El sistema combina el adaptador inteligente, el tanque de agua, las fórmulas de nutrición A/B y la maceta Copilot para monitorear y cuidar tus plantas casi sin intervención.",
      },
      {
        iconKey: "leaf",
        q: "¿Todas las plantas son compatibles con Smart Care?",
        a: "Muchas de nuestras plantas están marcadas como compatibles con Smart Care. Lo verás indicado en la ficha del producto y en la sección Smart Care.",
      },
    ],
  },
  {
    id: "cuidado",
    label: "Cuidado de plantas",
    iconKey: "droplets",
    faqs: [
      {
        iconKey: "droplets",
        q: "¿Cada cuánto debo regar mis plantas?",
        a: "Cada planta indica su frecuencia de riego recomendada en su ficha (por ejemplo, cada 7 días). Ajusta según la humedad y la temporada de tu espacio.",
      },
      {
        iconKey: "sun",
        q: "¿Cómo sé cuánta luz necesita mi planta?",
        a: "En cada ficha mostramos el nivel de luz ideal (baja, media o alta). Ubícala cerca de una ventana acorde a ese nivel para que crezca sana.",
      },
      {
        iconKey: "heart-pulse",
        q: "¿Qué hago si mi planta se ve marchita?",
        a: "Revisa el riego y la luz según lo indicado en su ficha. La mayoría de los problemas se corrigen ajustando la frecuencia de agua y la ubicación.",
      },
      {
        iconKey: "paw-print",
        q: "¿Las plantas son seguras para mascotas?",
        a: "Filtra el catálogo por plantas pet-friendly. Cada ficha indica claramente si la planta es apta o no apta para mascotas.",
      },
    ],
  },
  {
    id: "cuenta",
    label: "Cuenta y pedidos",
    iconKey: "user",
    faqs: [
      {
        iconKey: "package",
        q: "¿Dónde veo mis pedidos?",
        a: "En la sección Mis pedidos encuentras el historial de tus compras con su detalle y estado.",
      },
      {
        iconKey: "user",
        q: "¿Cómo actualizo mis datos de perfil?",
        a: "Desde Mi perfil puedes editar tu nombre, correo, teléfono y dirección de entrega para agilizar tus próximas compras.",
      },
      {
        iconKey: "bookmark",
        q: "¿Puedo guardar plantas para verlas después?",
        a: "Sí. Toca el ícono de guardar en cualquier planta y la encontrarás en Mis propuestas para retomarla cuando quieras.",
      },
    ],
  },
];
