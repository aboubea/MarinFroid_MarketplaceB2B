import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, deliveryAddresses } from "@marin-froid/db";
import { ensureAddressCoordinates } from "@/lib/address-geocoding";
import { geocodeAddress, nearestNeighborOrder, MARIN_FROID_DEPOT_ADDRESS, MARIN_FROID_DEPOT_FALLBACK } from "@/lib/geocode";

export async function POST(request: Request) {
  await requireMarinFroidSession();
  const { orderIds } = await request.json();
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return NextResponse.json({ error: "Aucune commande à optimiser." }, { status: 400 });
  }

  const db = getDb();
  const orderRows = await db.query.orders.findMany({ where: inArray(orders.id, orderIds) });

  const addressIds = orderRows.map((o) => o.deliveryAddressId).filter((id): id is string => !!id);
  const addresses = addressIds.length
    ? await db.query.deliveryAddresses.findMany({ where: inArray(deliveryAddresses.id, addressIds) })
    : [];
  const addressById = new Map(addresses.map((a) => [a.id, a]));

  const depot = (await geocodeAddress(MARIN_FROID_DEPOT_ADDRESS)) ?? MARIN_FROID_DEPOT_FALLBACK;

  const stops: { orderId: string; point: { lat: number; lng: number } }[] = [];
  const unlocated: string[] = [];

  for (const order of orderRows) {
    const address = order.deliveryAddressId ? addressById.get(order.deliveryAddressId) : null;
    if (!address) {
      unlocated.push(order.id);
      continue;
    }
    const point = await ensureAddressCoordinates(address);
    if (!point) {
      unlocated.push(order.id);
      continue;
    }
    stops.push({ orderId: order.id, point });
  }

  const ordered = nearestNeighborOrder(depot, stops);

  return NextResponse.json({
    sequence: [...ordered.map((s) => s.orderId), ...unlocated],
    unlocatedCount: unlocated.length,
  });
}
