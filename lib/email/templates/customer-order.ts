import { escapeHtml } from "@/lib/email/escape";
import {
  appBaseUrl,
  formatEstimatedDelivery,
  formatMoney,
  formatOrderDate,
  type OrderEmailPayload,
} from "@/lib/email/format";

function itemRows(order: OrderEmailPayload): string {
  return order.items
    .map((item) => {
      const name = escapeHtml(item.name);
      const subtitle = item.subtitle
        ? `<div style="margin-top:2px;font-size:12px;color:#6b736d;">${escapeHtml(item.subtitle)}</div>`
        : "";
      const lineTotal = formatMoney(item.priceQ * item.qty);
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #efe8dc;vertical-align:top;">
            <div style="font-size:14px;font-weight:600;color:#202421;">${name}</div>
            ${subtitle}
            <div style="margin-top:4px;font-size:12px;color:#6b736d;">Cantidad: ${item.qty}</div>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #efe8dc;vertical-align:top;text-align:right;white-space:nowrap;font-size:14px;font-weight:600;color:#202421;">
            ${lineTotal}
          </td>
        </tr>`;
    })
    .join("");
}

export function buildCustomerOrderEmail(order: OrderEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const firstName = order.customerName.split(/\s+/)[0] || "hola";
  const subject = `Confirmación de tu pedido ${order.id} — Plantik`;
  const ordersUrl = `${appBaseUrl()}/app/pedidos/${encodeURIComponent(order.id)}`;
  const shippingLabel =
    order.shippingQ <= 0 ? "Gratis" : formatMoney(order.shippingQ);

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
            <td style="background:linear-gradient(135deg,#1f5e3b 0%,#2f7a4f 100%);padding:28px 32px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.75);">Plantik</div>
              <div style="margin-top:10px;font-size:28px;line-height:1.2;color:#ffffff;">¡Gracias por tu compra!</div>
              <div style="margin-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:rgba(255,255,255,0.88);">
                Hola ${escapeHtml(firstName)}, tu pedido ya está confirmado.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eaf3e8;border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;width:50%;vertical-align:top;">
                    <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#5f8f68;font-weight:700;">Pedido</div>
                    <div style="margin-top:4px;font-size:15px;font-weight:700;color:#1f5e3b;">${escapeHtml(order.id)}</div>
                  </td>
                  <td style="padding:16px 18px;width:50%;vertical-align:top;">
                    <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#5f8f68;font-weight:700;">Entrega estimada</div>
                    <div style="margin-top:4px;font-size:15px;font-weight:700;color:#1f5e3b;">${escapeHtml(formatEstimatedDelivery(order.createdAt))}</div>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#3d443f;">
                Estamos preparando tu pedido con cuidado. Te avisaremos si necesitamos algo más para la entrega.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 8px;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:13px;font-weight:700;color:#202421;margin-bottom:4px;">Resumen</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${itemRows(order)}
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#6b736d;">Subtotal</td>
                  <td style="padding:6px 0;font-size:13px;color:#202421;text-align:right;">${formatMoney(order.subtotalQ)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#6b736d;">Envío</td>
                  <td style="padding:6px 0;font-size:13px;color:#202421;text-align:right;">${shippingLabel}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#1f5e3b;border-top:1px solid #efe8dc;">Total</td>
                  <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#1f5e3b;text-align:right;border-top:1px solid #efe8dc;">${formatMoney(order.totalQ)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 8px;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:13px;font-weight:700;color:#202421;">Entrega en</div>
              <div style="margin-top:6px;font-size:14px;line-height:1.5;color:#3d443f;">${escapeHtml(order.customerAddress)}</div>
              <div style="margin-top:10px;font-size:12px;color:#6b736d;">Pedido realizado el ${escapeHtml(formatOrderDate(order.createdAt))}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px;font-family:Arial,Helvetica,sans-serif;" align="center">
              <a href="${ordersUrl}" style="display:inline-block;background:#1f5e3b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 22px;border-radius:999px;">
                Ver mi pedido
              </a>
              <p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#6b736d;">
                ¿Dudas? Escríbenos a
                <a href="mailto:info@plantik.io" style="color:#1f5e3b;text-decoration:none;">info@plantik.io</a>
                o llama al +502 4585 4565.
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
    `¡Gracias por tu compra, ${firstName}!`,
    ``,
    `Tu pedido ${order.id} está confirmado.`,
    `Entrega estimada: ${formatEstimatedDelivery(order.createdAt)}`,
    ``,
    `Resumen:`,
    ...order.items.map(
      (item) =>
        `- ${item.name} × ${item.qty} — ${formatMoney(item.priceQ * item.qty)}`
    ),
    ``,
    `Subtotal: ${formatMoney(order.subtotalQ)}`,
    `Envío: ${shippingLabel}`,
    `Total: ${formatMoney(order.totalQ)}`,
    ``,
    `Entrega en: ${order.customerAddress}`,
    `Ver pedido: ${ordersUrl}`,
    ``,
    `Plantik · info@plantik.io · +502 4585 4565`,
  ].join("\n");

  return { subject, html, text };
}
