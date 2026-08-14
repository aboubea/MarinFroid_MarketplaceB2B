import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { orders, orderItems, orderStatusHistory, notificationRecipients } from "@marin-froid/db";
import { getCartWithItems, clearCart } from "./cart";
import { createEmailClient, orderCreatedEmail } from "@marin-froid/email";
import { isNotificationEnabled } from "./notification-settings";
import { logActivity, notifyUser } from "./activity";
import { getOrgBroadcastUsers } from "./org-recipients";
import { sendTrackedEmail } from "./email-log";

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
}) {
  const db = getDb();
  const { cart, items } = await getCartWithItems(params.organizationId, params.userId);
  if (items.length === 0) {
    throw new Error("EMPTY_CART");
  }

  const reference = generateReference();
  const [order] = await db
    .insert(orders)
    .values({
      reference,
      organizationId: params.organizationId,
      placedByUserId: params.userId,
      deliveryAddressId: params.deliveryAddressId ?? null,
      status: "submitted",
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

  await db.insert(orderStatusHistory).values({ orderId: order.id, status: "submitted" });

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
    body: `${items.length} article(s) — en attente de confirmation par l'équipe Marin Froid.`,
    orderId: order.id,
  });

  const broadcastUsers = await getOrgBroadcastUsers(params.organizationId, params.userId);
  for (const user of broadcastUsers) {
    await notifyUser({
      userId: user.id,
      organizationId: params.organizationId,
      category: "order_created",
      title: `Commande ${reference} transmise par ${params.userFullName ?? params.userEmail}`,
      body: `${items.length} article(s) — en attente de confirmation par l'équipe Marin Froid.`,
      orderId: order.id,
    });
  }

  await sendOrderCreatedEmails({
    reference,
    organizationName: params.organizationName,
    itemCount: items.length,
    orderId: order.id,
    customerEmail: params.userEmail,
    ccEmails: broadcastUsers.map((u) => u.email),
  });

  return order;
}

async function sendOrderCreatedEmails(params: {
  reference: string;
  organizationName: string;
  itemCount: number;
  orderId: string;
  customerEmail: string;
  ccEmails?: string[];
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
      itemCount: params.itemCount,
      orderUrl,
      isForOps: false,
    });
    const recipients = [params.customerEmail, ...(params.ccEmails ?? [])];
    for (const email of recipients) {
      await sendTrackedEmail(emailClient, "order_created", { to: email, ...customerTemplate, relatedOrderId: params.orderId });
    }
  }

  if (await isNotificationEnabled("order_created", "ops")) {
    const recipients = await db.query.notificationRecipients.findMany({ where: eq(notificationRecipients.active, true) });
    const opsTemplate = orderCreatedEmail({
      reference: params.reference,
      organizationName: params.organizationName,
      itemCount: params.itemCount,
      orderUrl,
      isForOps: true,
    });
    for (const recipient of recipients) {
      await sendTrackedEmail(emailClient, "order_created", { to: recipient.email, ...opsTemplate, relatedOrderId: params.orderId });
    }
  }
}
