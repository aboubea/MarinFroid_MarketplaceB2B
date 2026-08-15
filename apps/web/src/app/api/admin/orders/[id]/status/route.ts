import { NextResponse } from "next/server";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { changeOrderStatus } from "@/lib/order-status-service";

const VALID_STATUSES = ["submitted", "acknowledged", "processing", "shipped", "completed", "cancelled"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireMarinFroidSession();
  const { status } = await request.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  try {
    await changeOrderStatus({ orderId: id, status, actorUserId: session.userId, actorLabel: session.fullName });
  } catch (err) {
    if (err instanceof Error && err.message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
