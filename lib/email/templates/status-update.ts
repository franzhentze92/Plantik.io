import { escapeHtml } from "@/lib/email/escape";
import {
  appBaseUrl,
  formatMoney,
  formatOrderDate,
  type OrderEmailPayload,
} from "@/lib/email/format";
import { formatOrderStatus } from "@/lib/order-display";

type StatusCopy = {
  headline: string;
  body: string;
  accent: string;
};

function statusCopy(status: string): StatusCopy {
  switch (status) {
    case "entregado":
      return {
        headline: "¡Tu pedido fue entregado!",
        body: "Confirmamos que tu pedido ya llegó a destino. Esperamos que disfrutes tus plantas.",
        accent: "#1f5e3b",
      };
    case "cancelado":
      return {
        headline: "Tu pedido fue cancelado",
        body: "Este pedido quedó cancelado. Si no lo esperabas o necesitas ayuda, escríbenos y lo revisamos contigo.",
        accent: "#b42318",
      };
    case "pendiente_pago":
      return {
        headline: "Tu pedido quedó pendiente de pago",
        body: "Aún no registramos el pago de este pedido. Cuando se confirme, seguiremos con la preparación y entrega.",
        accent: "#b54708",
      };
    case "en_proceso":
    default:
      return {
        headline: "Tu pedido está en proceso",
        body: "Estamos preparando tu pedido con cuidado. Te avisaremos cuando cambie a entregado.",
        accent: "#026aa2",
      };
  }
}

export function buildCustomerStatusEmail(
  order: OrderEmailPayload,
  previousStatus?: string
): { subject: string; html: string; text: string } {
  const firstName = order.customerName.split(/\s+/)[0] || "hola";
  const statusLabel = formatOrderStatus(order.status);
  const previousLabel = previousStatus
    ? formatOrderStatus(previousStatus)
    : null;
  const copy = statusCopy(order.status);
  const subject = `${statusLabel}: pedido ${order.id} — Plantik`;
  const ordersUrl = `${appBaseUrl()}/app/pedidos/${encodeURIComponent(order.id)}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f7f4ed;font-family:Georgia,'Times New Roman',serif;color:#202421;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ed;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e9e0d2;">
          <tr>
            <td style="background:${copy.accent};padding:28px 32px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.75);">Plantik</div>
              <div style="margin-top:10px;font-size:26px;line-height:1.25;color:#ffffff;">${escapeHtml(copy.headline)}</div>
              <div style="margin-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:rgba(255,255,255,0.9);">
                Hola ${escapeHtml(firstName)}, actualizamos el estado de tu pedido.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eaf3e8;border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;width:50%;vertical-align:top;">
                    <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#5f8f68;font-weight:700;">Pedido</div>
                    <div style="margin-top:4px;font-size:15px;font-weight:700;color:#1f5e3b;">${escapeHtml(order.id)}</div>
                  </td>
                  <td style="padding:16px 18px;width:50%;vertical-align:top;">
                    <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#5f8f68;font-weight:700;">Nuevo estado</div>
                    <div style="margin-top:4px;font-size:15px;font-weight:700;color:#1f5e3b;">${escapeHtml(statusLabel)}</div>
                  </td>
                </tr>
              </table>
              ${
                previousLabel
                  ? `<p style="margin:16px 0 0;font-size:13px;color:#6b736d;">Antes: <strong style="color:#202421;">${escapeHtml(previousLabel)}</strong></p>`
                  : ""
              }
              <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#3d443f;">
                ${escapeHtml(copy.body)}
              </p>
              <p style="margin:18px 0 0;font-size:13px;color:#6b736d;">
                Total del pedido: <strong style="color:#202421;">${formatMoney(order.totalQ)}</strong>
              </p>
              <div style="margin-top:24px;text-align:center;">
                <a href="${ordersUrl}" style="display:inline-block;background:#1f5e3b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 22px;border-radius:999px;">
                  Ver mi pedido
                </a>
              </div>
              <p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#6b736d;text-align:center;">
                ¿Dudas? Escríbenos a
                <a href="mailto:info@plantik.io" style="color:#1f5e3b;text-decoration:none;">info@plantik.io</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:18px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8a918b;">
          Plantik · Plantas. Diseño. Bienestar. · Guatemala
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `${copy.headline}`,
    ``,
    `Hola ${firstName},`,
    `Pedido ${order.id} ahora está: ${statusLabel}.`,
    previousLabel ? `Antes: ${previousLabel}` : null,
    ``,
    copy.body,
    `Total: ${formatMoney(order.totalQ)}`,
    `Ver pedido: ${ordersUrl}`,
    ``,
    `Plantik · info@plantik.io`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

export function buildAdminStatusEmail(
  order: OrderEmailPayload,
  previousStatus?: string
): { subject: string; html: string; text: string } {
  const statusLabel = formatOrderStatus(order.status);
  const previousLabel = previousStatus
    ? formatOrderStatus(previousStatus)
    : null;
  const subject = `Estado actualizado ${order.id} → ${statusLabel}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f1ec;font-family:Arial,Helvetica,sans-serif;color:#202421;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1ec;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e4ddd0;">
          <tr>
            <td style="background:#202421;padding:22px 28px;">
              <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a6ff3c;font-weight:700;">Plantik · Admin</div>
              <div style="margin-top:8px;font-size:22px;font-weight:700;color:#ffffff;">Estado de pedido actualizado</div>
              <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.72);">${escapeHtml(formatOrderDate(new Date().toISOString()))}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eaf3e8;border-radius:10px;">
                <tr>
                  <td style="padding:14px 16px;width:33%;vertical-align:top;">
                    <div style="font-size:11px;color:#5f8f68;font-weight:700;text-transform:uppercase;">Pedido</div>
                    <div style="margin-top:4px;font-size:15px;font-weight:700;color:#1f5e3b;">${escapeHtml(order.id)}</div>
                  </td>
                  <td style="padding:14px 16px;width:33%;vertical-align:top;">
                    <div style="font-size:11px;color:#5f8f68;font-weight:700;text-transform:uppercase;">Nuevo estado</div>
                    <div style="margin-top:4px;font-size:15px;font-weight:700;color:#1f5e3b;">${escapeHtml(statusLabel)}</div>
                  </td>
                  <td style="padding:14px 16px;width:34%;vertical-align:top;">
                    <div style="font-size:11px;color:#5f8f68;font-weight:700;text-transform:uppercase;">Total</div>
                    <div style="margin-top:4px;font-size:15px;font-weight:700;color:#1f5e3b;">${formatMoney(order.totalQ)}</div>
                  </td>
                </tr>
              </table>
              ${
                previousLabel
                  ? `<p style="margin:16px 0 0;font-size:13px;color:#6b736d;">Estado anterior: <strong style="color:#202421;">${escapeHtml(previousLabel)}</strong></p>`
                  : ""
              }
              <div style="margin-top:18px;font-size:13px;font-weight:700;">Cliente</div>
              <div style="margin-top:6px;font-size:14px;line-height:1.55;color:#3d443f;">
                <strong style="color:#202421;">${escapeHtml(order.customerName)}</strong><br />
                <a href="mailto:${escapeHtml(order.customerEmail)}" style="color:#1f5e3b;text-decoration:none;">${escapeHtml(order.customerEmail)}</a><br />
                ${escapeHtml(order.customerAddress)}
              </div>
              <p style="margin:20px 0 0;font-size:12px;color:#6b736d;line-height:1.5;">
                También se envió una notificación al cliente sobre este cambio.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Estado actualizado: ${order.id}`,
    `Nuevo estado: ${statusLabel}`,
    previousLabel ? `Antes: ${previousLabel}` : null,
    `Total: ${formatMoney(order.totalQ)}`,
    ``,
    `Cliente: ${order.customerName}`,
    `Correo: ${order.customerEmail}`,
    `Dirección: ${order.customerAddress}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}
