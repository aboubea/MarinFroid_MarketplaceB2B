import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, orderItems, users } from "@marin-froid/db";
import { createEmailClient, volumeAdjustedEmail } from "@marin-froid/email";
import { sendTrackedEmail } from "@/lib/email-log";
import { getOrgBroadcastUsers } from "@/lib/org-recipients";
import { changeOrderStatus } from "@/lib/order-status-service";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireMarinFroidSession();
  const { items } = await request.json();

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }

  const db = getDb();
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  if (order.status !== "processing") {
    return NextResponse.json({ error: "La commande doit être en préparation pour valider les volumes." }, { status: 400 });
  }

  const existingItems = await db.query.orderItems.findMany({ where: eq(orderItems.orderId, id) });
  const changes: { name: string; ordered: number; prepared: number; unit: string }[] = [];

  for (const submitted of items as { itemId: string; preparedQuantity: number }[]) {
    const existing = existingItems.find((i) => i.id === submitted.itemId);
    if (!existing) continue;
    const prepared = Math.max(0, Math.floor(submitted.preparedQuantity));
    await db.update(orderItems).set({ preparedQuantity: prepared }).where(eq(orderItems.id, existing.id));
    if (prepared !== existing.quantity) {
      changes.push({ name: existing.productNameSnapshot, ordered: existing.quantity, prepared, unit: existing.unitSnapshot });
    }
  }

  await logActivity({
    actorUserId: session.userId,
    actorLabel: session.fullName,
    organizationId: order.organizationId,
    action: "order_prep_finalized",
    entityType: "order",
    entityId: order.id,
    summary: `Préparation validée pour ${order.reference}${changes.length ? ` (${changes.length} volume(s) ajusté(s))` : ""}`,
  });

  if (changes.length > 0) {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const placedByUser = await db.query.users.findFirst({ where: eq(users.id, order.placedByUserId) });
      const broadcastUsers = await getOrgBroadcastUsers(order.organizationId, order.placedByUserId);
      const recipients = [placedByUser?.email, ...broadcastUsers.map((u) => u.email)].filter((e): e is string => !!e);
      if (recipients.length > 0) {
        const emailClient = createEmailClient(apiKey);
        const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
        const template = volumeAdjustedEmail({
          reference: order.reference,
          orderUrl: `${baseUrl}/orders/${order.id}`,
          changes,
        });
        for (const email of recipients) {
          await sendTrackedEmail(emailClient, "order_status_updated", { to: email, ...template, relatedOrderId: order.id });
        }
      }
    }
  }

  await changeOrderStatus({ orderId: id, status: "shipped", actorUserId: session.userId, actorLabel: session.fullName });

  return NextResponse.json({ ok: true, adjustedCount: changes.length });
}
