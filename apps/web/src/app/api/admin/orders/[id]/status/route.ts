import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, orderStatusHistory, users } from "@marin-froid/db";
import { createEmailClient, orderStatusUpdatedEmail } from "@marin-froid/email";
import { isNotificationEnabled } from "@/lib/notification-settings";

const VALID_STATUSES = ["submitted", "acknowledged", "processing", "shipped", "completed", "cancelled"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireMarinFroidSession();
  const { status } = await request.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const db = getDb();
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
  await db.insert(orderStatusHistory).values({ orderId: id, status, changedByUserId: session.userId });

  const placedByUser = await db.query.users.findFirst({ where: eq(users.id, order.placedByUserId) });
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && placedByUser && (await isNotificationEnabled("order_status_updated", "customer"))) {
    const emailClient = createEmailClient(apiKey);
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    const template = orderStatusUpdatedEmail({
      reference: order.reference,
      status,
      orderUrl: `${baseUrl}/orders/${order.id}`,
    });
    await emailClient.send({ to: placedByUser.email, ...template }).catch((err) => console.error("email error", err));
  }

  return NextResponse.json({ ok: true });
}
