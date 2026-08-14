import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { orders, orderItems, orderStatusHistory, notificationRecipients } from "@marin-froid/db";
import { getCartWithItems, clearCart } from "./cart";
import { createEmailClient, orderCreatedEmail } from "@marin-froid/email";
import { isNotificationEnabled } from "./notification-settings";

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

  await sendOrderCreatedEmails({
    reference,
    organizationName: params.organizationName,
    itemCount: items.length,
    orderId: order.id,
    customerEmail: params.userEmail,
  });

  return order;
}

async function sendOrderCreatedEmails(params: {
  reference: string;
  organizationName: string;
  itemCount: number;
  orderId: string;
  customerEmail: string;
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
    await emailClient.send({ to: params.customerEmail, ...customerTemplate }).catch((err) => console.error("email error", err));
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
      await emailClient.send({ to: recipient.email, ...opsTemplate }).catch((err) => console.error("email error", err));
    }
  }
}
