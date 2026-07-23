import { Resend } from "resend";
import {
  toOrderEmailPayload,
  type OrderEmailInput,
  type OrderEmailPayload,
} from "@/lib/email/format";
import { buildAdminOrderEmail } from "@/lib/email/templates/admin-order";
import { buildCustomerOrderEmail } from "@/lib/email/templates/customer-order";
import {
  buildAdminStatusEmail,
  buildCustomerStatusEmail,
} from "@/lib/email/templates/status-update";
import { normalizeOrderStatus } from "@/lib/order-display";

export type SendOrderEmailsResult = {
  customerSent: boolean;
  adminSent: boolean;
  skippedReason?: string;
  errors: string[];
};

function getAdminEmail(): string {
  return (
    process.env.ORDER_ADMIN_EMAIL?.trim() || "hentzefranz92@gmail.com"
  );
}

function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    "Plantik <info@plantik.io>"
  );
}

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

async function sendOne(args: {
  resend: Resend;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<void> {
  const { error } = await args.resend.emails.send({
    from: getFromAddress(),
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
    replyTo: args.replyTo,
  });

  if (error) {
    throw new Error(error.message || "No se pudo enviar el correo.");
  }
}

async function sendCustomerAndAdmin(args: {
  payload: OrderEmailPayload;
  customer: { subject: string; html: string; text: string };
  admin: { subject: string; html: string; text: string };
}): Promise<SendOrderEmailsResult> {
  const resend = getResendClient();
  if (!resend) {
    return {
      customerSent: false,
      adminSent: false,
      skippedReason: "RESEND_API_KEY no configurada",
      errors: [],
    };
  }

  const adminEmail = getAdminEmail();
  const errors: string[] = [];
  let customerSent = false;
  let adminSent = false;

  try {
    await sendOne({
      resend,
      to: args.payload.customerEmail,
      subject: args.customer.subject,
      html: args.customer.html,
      text: args.customer.text,
      replyTo: "info@plantik.io",
    });
    customerSent = true;
  } catch (error) {
    errors.push(
      `cliente: ${error instanceof Error ? error.message : "error desconocido"}`
    );
  }

  try {
    await sendOne({
      resend,
      to: adminEmail,
      subject: args.admin.subject,
      html: args.admin.html,
      text: args.admin.text,
      replyTo: args.payload.customerEmail,
    });
    adminSent = true;
  } catch (error) {
    errors.push(
      `admin: ${error instanceof Error ? error.message : "error desconocido"}`
    );
  }

  return { customerSent, adminSent, errors };
}

export async function sendOrderEmailsFromPayload(
  order: OrderEmailPayload
): Promise<SendOrderEmailsResult> {
  return sendCustomerAndAdmin({
    payload: order,
    customer: buildCustomerOrderEmail(order),
    admin: buildAdminOrderEmail(order),
  });
}

export async function sendOrderEmails(
  order: OrderEmailInput
): Promise<SendOrderEmailsResult> {
  const payload = toOrderEmailPayload(order);
  if (!payload) {
    return {
      customerSent: false,
      adminSent: false,
      skippedReason: "El pedido no tiene correo del cliente",
      errors: [],
    };
  }

  return sendOrderEmailsFromPayload(payload);
}

export async function sendOrderStatusEmails(
  order: OrderEmailInput,
  previousStatus?: string
): Promise<SendOrderEmailsResult> {
  const payload = toOrderEmailPayload(order);
  if (!payload) {
    return {
      customerSent: false,
      adminSent: false,
      skippedReason: "El pedido no tiene correo del cliente",
      errors: [],
    };
  }

  const previous = previousStatus
    ? normalizeOrderStatus(previousStatus)
    : undefined;
  const next = normalizeOrderStatus(payload.status);

  if (previous && previous === next) {
    return {
      customerSent: false,
      adminSent: false,
      skippedReason: "El estado no cambió",
      errors: [],
    };
  }

  return sendCustomerAndAdmin({
    payload: { ...payload, status: next },
    customer: buildCustomerStatusEmail(
      { ...payload, status: next },
      previous
    ),
    admin: buildAdminStatusEmail({ ...payload, status: next }, previous),
  });
}
