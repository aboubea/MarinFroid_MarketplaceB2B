import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { orders, orderStatusHistory, users } from "@marin-froid/db";
import { createEmailClient, orderStatusUpdatedEmail } from "@marin-froid/email";
import { isNotificationEnabled } from "./notification-settings";
import { logActivity, notifyUser } from "./activity";
import { getOrgBroadcastUsers } from "./org-recipients";
import { sendTrackedEmail } from "./email-log";

export const ORDER_STATUS_LABELS_FR: Record<string, string> = {
  submitted: "reçue",
  acknowledged: "confirmée",
  processing: "en préparation",
  shipped: "expédiée",
  completed: "livrée",
  cancelled: "annulée",
};

export async function changeOrderStatus(params: {
  orderId: string;
  status: "submitted" | "acknowledged" | "processing" | "shipped" | "completed" | "cancelled";
  actorUserId?: string | null;
  actorLabel?: string;
}) {
  const db = getDb();
  const order = await db.query.orders.findFirst({ where: eq(orders.id, params.orderId) });
  if (!order) throw new Error("ORDER_NOT_FOUND");

  await db.update(orders).set({ status: params.status, updatedAt: new Date() }).where(eq(orders.id, params.orderId));
  await db.insert(orderStatusHistory).values({ orderId: params.orderId, status: params.status, changedByUserId: params.actorUserId ?? null });

  const label = ORDER_STATUS_LABELS_FR[params.status] ?? params.status;

  await logActivity({
    actorUserId: params.actorUserId ?? null,
    actorLabel: params.actorLabel ?? "Système",
    organizationId: order.organizationId,
    action: "order_status_updated",
    entityType: "order",
    entityId: order.id,
    summary: `Commande ${order.reference} passée au statut « ${label} »`,
  });

  await notifyUser({
    userId: order.placedByUserId,
    organizationId: order.organizationId,
    category: "order_status_updated",
    title: `Commande ${order.reference} ${label}`,
    orderId: order.id,
  });

  const broadcastUsers = await getOrgBroadcastUsers(order.organizationId, order.placedByUserId);
  for (const user of broadcastUsers) {
    await notifyUser({
      userId: user.id,
      organizationId: order.organizationId,
      category: "order_status_updated",
      title: `Commande ${order.reference} ${label}`,
      orderId: order.id,
    });
  }

  const placedByUser = await db.query.users.findFirst({ where: eq(users.id, order.placedByUserId) });
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && placedByUser && (await isNotificationEnabled("order_status_updated", "customer"))) {
    const emailClient = createEmailClient(apiKey);
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    const template = orderStatusUpdatedEmail({
      reference: order.reference,
      status: params.status,
      orderUrl: `${baseUrl}/orders/${order.id}`,
      estimatedDeliveryDate: order.estimatedDeliveryDate
        ? new Date(order.estimatedDeliveryDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
        : null,
    });
    const recipients = [placedByUser.email, ...broadcastUsers.map((u) => u.email)];
    for (const email of recipients) {
      await sendTrackedEmail(emailClient, "order_status_updated", { to: email, ...template, relatedOrderId: order.id });
    }
  }

  return order;
}
