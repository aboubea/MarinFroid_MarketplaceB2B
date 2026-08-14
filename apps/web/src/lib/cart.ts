import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { carts, cartItems, products } from "@marin-froid/db";

export async function getOrCreateCart(organizationId: string, userId: string) {
  const db = getDb();
  const existing = await db.query.carts.findFirst({
    where: and(eq(carts.organizationId, organizationId), eq(carts.userId, userId)),
  });
  if (existing) return existing;
  const [created] = await db
    .insert(carts)
    .values({ organizationId, userId })
    .returning();
  return created;
}

export async function addToCart(organizationId: string, userId: string, productId: string, quantity: number) {
  const db = getDb();
  const cart = await getOrCreateCart(organizationId, userId);
  const existingItem = await db.query.cartItems.findFirst({
    where: and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)),
  });
  if (existingItem) {
    await db
      .update(cartItems)
      .set({ quantity: existingItem.quantity + quantity })
      .where(eq(cartItems.id, existingItem.id));
  } else {
    await db.insert(cartItems).values({ cartId: cart.id, productId, quantity });
  }
  return getCartWithItems(organizationId, userId);
}

export async function updateCartItemQuantity(organizationId: string, userId: string, productId: string, quantity: number) {
  const db = getDb();
  const cart = await getOrCreateCart(organizationId, userId);
  if (quantity <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)));
  } else {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)));
  }
  return getCartWithItems(organizationId, userId);
}

export async function getCartWithItems(organizationId: string, userId: string) {
  const db = getDb();
  const cart = await getOrCreateCart(organizationId, userId);
  const items = await db
    .select({
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      name: products.name,
      sku: products.sku,
      unit: products.unit,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.productId))
    .where(eq(cartItems.cartId, cart.id));
  return { cart, items };
}

export async function clearCart(cartId: string) {
  const db = getDb();
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}
