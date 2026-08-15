import { eq } from "drizzle-orm";
import { deliveryAddresses } from "@marin-froid/db";
import { getDb } from "./db";
import { geocodeAddress, type GeoPoint } from "./geocode";

interface AddressLike {
  id: string;
  line1: string;
  postalCode: string;
  city: string;
  country: string;
  lat: string | null;
  lng: string | null;
}

export async function ensureAddressCoordinates(address: AddressLike): Promise<GeoPoint | null> {
  if (address.lat && address.lng) {
    return { lat: Number(address.lat), lng: Number(address.lng) };
  }
  const query = `${address.line1}, ${address.postalCode} ${address.city}, ${address.country}`;
  const point = await geocodeAddress(query);
  if (!point) return null;

  const db = getDb();
  await db
    .update(deliveryAddresses)
    .set({ lat: point.lat.toFixed(6), lng: point.lng.toFixed(6) })
    .where(eq(deliveryAddresses.id, address.id));

  return point;
}
