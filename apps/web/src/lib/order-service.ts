import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { orders, orderItems, orderStatusHistory, notificationRecipients, deliveryAddresses, users } from "@marin-froid/db";
import { getCartWithItems, clearCart } from "./cart";
import { createEmailClient, orderCreatedEmail } from "@marin-froid/email";
import { isNotificationEnabled } from "./notification-settings";
import { logActivity, notifyUser } from "./activity";
import { getOrgBroadcastUsers } from "./org-recipients";
import { sendTrackedEmail } from "./email-log";

function nextThursday(from: Date): Date {
  const d = new Date(from);
  const day = d.getDay();
  let diff = (4 - day + 7) % 7;
  if (diff === 0) diff = 7;
  d.setDate(d.getDate() + diff);
  d.setHours(9, 0, 0, 0);
  return d;
}

function generateReference() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MF-${y}${m}${d}-${rand}`;
}

export async function submitOrderFromCart(params: {
  organizationId: string;
  organizationName: string;
  userId: string;
  userEmail: string;
  userFullName?: string;
  deliveryAddressId?: string | null;
  notes?: string | null;
}) {
  const db = getDb();
  const { cart, items } = await getCartWithItems(params.organizationId, params.userId);
  if (items.length === 0) {
    throw new Error("EMPTY_CART");
  }

  const reference = generateReference();
  const estimatedDeliveryDate = nextThursday(new Date());
  const [order] = await db
    .insert(orders)
    .values({
      reference,
      organizationId: params.organizationId,
      placedByUserId: params.userId,
      deliveryAddressId: params.deliveryAddressId ?? null,
      notes: params.notes ?? null,
      estimatedDeliveryDate,
      // No separate confirmation step anymore — an order goes straight to
      // "in preparation" the moment it's placed. Marin Froid staff no
      // longer have a dedicated ops interface; they just receive an email
      // (see sendOrderCreatedEmails below) with the order to fulfill.
      status: "processing",
    })
    .returning();

  await db.insert(orderItems).values(
    items.map((i) => ({
      orderId: order.id,
      productId: i.productId,
      productNameSnapshot: i.name,
      skuSnapshot: i.sku,
      unitSnapshot: i.unit,
      quantity: i.quantity,
    }))
  );

  await db.insert(orderStatusHistory).values({ orderId: order.id, status: "processing" });

  await clearCart(cart.id);

  await logActivity({
    actorUserId: params.userId,
    actorLabel: params.userFullName ?? params.userEmail,
    organizationId: params.organizationId,
    action: "order_created",
    entityType: "order",
    entityId: order.id,
    summary: `Commande ${reference} créée par ${params.organizationName}`,
  });

  await notifyUser({
    userId: params.userId,
    organizationId: params.organizationId,
    category: "order_created",
    title: `Commande ${reference} transmise`,
    body: `${items.length} article(s) — en cours de préparation par l'équipe Marin Froid.`,
    orderId: order.id,
  });

  const broadcastUsers = await getOrgBroadcastUsers(params.organizationId, params.userId);
  for (const user of broadcastUsers) {
    await notifyUser({
      userId: user.id,
      organizationId: params.organizationId,
      category: "order_created",
      title: `Commande ${reference} transmise par ${params.userFullName ?? params.userEmail}`,
      body: `${items.length} article(s) — en cours de préparation par l'équipe Marin Froid.`,
      orderId: order.id,
    });
  }

  const address = params.deliveryAddressId
    ? await db.query.deliveryAddresses.findFirst({ where: eq(deliveryAddresses.id, params.deliveryAddressId) })
    : null;

  await sendOrderCreatedEmails({
    reference,
    organizationName: params.organizationName,
    items: items.map((i) => ({ name: i.name, sku: i.sku, quantity: i.quantity, unit: i.unit })),
    orderId: order.id,
    customerEmail: params.userEmail,
    ccEmails: broadcastUsers.map((u) => u.email),
    estimatedDeliveryDate: estimatedDeliveryDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
    deliveryAddress: address ? `${address.label} · ${address.line1}, ${address.postalCode} ${address.city}` : null,
    notes: params.notes ?? null,
  });

  return order;
}

async function sendOrderCreatedEmails(params: {
  reference: string;
  organizationName: string;
  items: { name: string; sku: string; quantity: number; unit: string }[];
  orderId: string;
  customerEmail: string;
  ccEmails?: string[];
  estimatedDeliveryDate?: string | null;
  deliveryAddress?: string | null;
  notes?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set, skipping order emails");
    return;
  }
  const db = getDb();
  const emailClient = createEmailClient(apiKey);
  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  const orderUrl = `${baseUrl}/orders/${params.orderId}`;

  if (await isNotificationEnabled("order_created", "customer")) {
    const customerTemplate = orderCreatedEmail({
      reference: params.reference,
      organizationName: params.organizationName,
      items: params.items,
      orderUrl,
      isForOps: false,
      estimatedDeliveryDate: params.estimatedDeliveryDate,
    });
    const recipients = [params.customerEmail, ...(params.ccEmails ?? [])];
    for (const email of recipients) {
      await sendTrackedEmail(emailClient, "order_created", { to: email, ...customerTemplate, relatedOrderId: params.orderId });
    }
  }

  if (await isNotificationEnabled("order_created", "ops")) {
    const [manualRecipients, opsStaff] = await Promise.all([
      db.query.notificationRecipients.findMany({ where: eq(notificationRecipients.active, true) }),
      db.query.users.findMany({ where: and(eq(users.role, "mf_ops"), eq(users.active, true)) }),
    ]);
    const opsEmails = new Set([...manualRecipients.map((r) => r.email), ...opsStaff.map((u) => u.email)]);
    const opsTemplate = orderCreatedEmail({
      reference: params.reference,
      organizationName: params.organizationName,
      items: params.items,
      orderUrl,
      isForOps: true,
      estimatedDeliveryDate: params.estimatedDeliveryDate,
      deliveryAddress: params.deliveryAddress,
      notes: params.notes,
    });
    for (const email of opsEmails) {
      await sendTrackedEmail(emailClient, "order_created", { to: email, ...opsTemplate, relatedOrderId: params.orderId });
    }
  }
}
