import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { changeOrderStatus } from "@/lib/order-status-service";

function endOfDay(d: Date): Date {
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Runs the delivery-day status automation. Orders always ship on their
 * estimatedDeliveryDate (always a Thursday, see nextThursday() in
 * order-service.ts), so there's no separate day-of-week check needed —
 * "due today" already only ever matches a Thursday.
 *
 * Called twice a day by vercel.json's cron entries for this same path
 * (~7:00 and ~17:00 UTC, i.e. morning and ~18:00 Paris time — exact local
 * hour drifts a little with DST, which is an acceptable approximation
 * here). Which phase runs is decided by the hour at request time rather
 * than a query param, so both schedule entries can point at the same URL:
 *  - Morning: orders in preparation whose delivery is today move to
 *    "shipped", telling the client their order is on its way.
 *  - Evening: today's shipped orders move to "completed".
 * Admins never set these statuses manually — see OrderStatusSelect.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
  }

  const db = getDb();
  const now = new Date();
  const isEvening = now.getUTCHours() >= 12;
  // <= end of today, not strict same-day equality, so a missed run (e.g.
  // an outage) still gets caught the next time this fires instead of
  // leaving the order stuck.
  const dueBy = endOfDay(now);

  if (!isEvening) {
    const dueToShip = await db.query.orders.findMany({
      where: (o, { and, eq, lte }) => and(eq(o.status, "processing"), lte(o.estimatedDeliveryDate, dueBy)),
    });
    let shipped = 0;
    for (const order of dueToShip) {
      await changeOrderStatus({ orderId: order.id, status: "shipped", actorLabel: "Automatique (jour de livraison)" });
      shipped++;
    }
    return NextResponse.json({ ok: true, phase: "ship", shipped });
  }

  const dueToComplete = await db.query.orders.findMany({
    where: (o, { and, eq, lte }) => and(eq(o.status, "shipped"), lte(o.estimatedDeliveryDate, dueBy)),
  });
  let completed = 0;
  for (const order of dueToComplete) {
    await changeOrderStatus({ orderId: order.id, status: "completed", actorLabel: "Automatique (livraison du jour effectuée)" });
    completed++;
  }
  return NextResponse.json({ ok: true, phase: "complete", completed });
}
