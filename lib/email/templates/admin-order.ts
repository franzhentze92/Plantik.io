import { escapeHtml } from "@/lib/email/escape";
import {
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
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #efe8dc;vertical-align:top;">
            <div style="font-size:14px;font-weight:600;color:#202421;">${name}</div>
            ${subtitle}
            <div style="margin-top:4px;font-size:12px;color:#6b736d;">Cantidad: ${item.qty} · Unitario: ${formatMoney(item.priceQ)}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #efe8dc;vertical-align:top;text-align:right;white-space:nowrap;font-size:14px;font-weight:600;color:#202421;">
            ${formatMoney(item.priceQ * item.qty)}
          </td>
        </tr>`;
    })
    .join("");
}

export function buildAdminOrderEmail(order: OrderEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Nuevo pedido ${order.id} · ${formatMoney(order.totalQ)}`;
  const shippingLabel =
    order.shippingQ <= 0 ? "Gratis" : formatMoney(order.shippingQ);

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
              <div style="margin-top:8px;font-size:22px;font-weight:700;color:#ffffff;">Nuevo pedido recibido</div>
              <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.72);">${escapeHtml(formatOrderDate(order.createdAt))}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eaf3e8;border-radius:10px;">
                <tr>
                  <td style="padding:14px 16px;width:33%;vertical-align:top;">
                    <div style="font-size:11px;color:#5f8f68;font-weight:700;text-transform:uppercase;">Pedido</div>
                    <div style="margin-top:4px;font-size:15px;font-weight:700;color:#1f5e3b;">${escapeHtml(order.id)}</div>
                  </td>
                  <td style="padding:14px 16px;width:33%;vertical-align:top;">
                    <div style="font-size:11px;color:#5f8f68;font-weight:700;text-transform:uppercase;">Total</div>
                    <div style="margin-top:4px;font-size:15px;font-weight:700;color:#1f5e3b;">${formatMoney(order.totalQ)}</div>
                  </td>
                  <td style="padding:14px 16px;width:34%;vertical-align:top;">
                    <div style="font-size:11px;color:#5f8f68;font-weight:700;text-transform:uppercase;">Entrega</div>
                    <div style="margin-top:4px;font-size:15px;font-weight:700;color:#1f5e3b;">${escapeHtml(formatEstimatedDelivery(order.createdAt))}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 8px;">
              <div style="font-size:13px;font-weight:700;margin-bottom:8px;">Cliente</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;border-radius:10px;">
                <tr>
                  <td style="padding:14px 16px;font-size:14px;line-height:1.55;color:#3d443f;">
                    <strong style="color:#202421;">${escapeHtml(order.customerName)}</strong><br />
                    <a href="mailto:${escapeHtml(order.customerEmail)}" style="color:#1f5e3b;text-decoration:none;">${escapeHtml(order.customerEmail)}</a><br />
                    ${escapeHtml(order.customerAddress)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 8px;">
              <div style="font-size:13px;font-weight:700;margin-bottom:4px;">Productos</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${itemRows(order)}
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
                <tr>
                  <td style="padding:5px 0;font-size:13px;color:#6b736d;">Subtotal</td>
                  <td style="padding:5px 0;font-size:13px;text-align:right;">${formatMoney(order.subtotalQ)}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:13px;color:#6b736d;">Envío</td>
                  <td style="padding:5px 0;font-size:13px;text-align:right;">${shippingLabel}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0 0;font-size:15px;font-weight:700;border-top:1px solid #efe8dc;">Total</td>
                  <td style="padding:10px 0 0;font-size:15px;font-weight:700;text-align:right;border-top:1px solid #efe8dc;">${formatMoney(order.totalQ)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;font-size:12px;color:#6b736d;line-height:1.5;">
              Este aviso se envió automáticamente desde Plantik cuando el pedido quedó marcado como pagado.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Nuevo pedido ${order.id}`,
    `Total: ${formatMoney(order.totalQ)}`,
    `Fecha: ${formatOrderDate(order.createdAt)}`,
    `Entrega estimada: ${formatEstimatedDelivery(order.createdAt)}`,
    ``,
    `Cliente: ${order.customerName}`,
    `Correo: ${order.customerEmail}`,
    `Dirección: ${order.customerAddress}`,
    ``,
    `Productos:`,
    ...order.items.map(
      (item) =>
        `- ${item.name} × ${item.qty} — ${formatMoney(item.priceQ * item.qty)}`
    ),
    ``,
    `Subtotal: ${formatMoney(order.subtotalQ)}`,
    `Envío: ${shippingLabel}`,
    `Total: ${formatMoney(order.totalQ)}`,
  ].join("\n");

  return { subject, html, text };
}
