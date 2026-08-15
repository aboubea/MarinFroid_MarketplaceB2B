import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "mf_admin",
  "mf_ops",
  "org_admin",
  "org_buyer",
  "org_viewer",
]);

export const orgStatusEnum = pgEnum("org_status", [
  "invited",
  "active",
  "suspended",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "submitted",
  "acknowledged",
  "processing",
  "shipped",
  "completed",
  "cancelled",
]);

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "expired",
  "revoked",
]);

// --- Organizations (client companies) ---
export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  status: orgStatusEnum("status").notNull().default("invited"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const deliveryAddresses = pgTable("delivery_addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("FR"),
  isDefault: boolean("is_default").notNull().default(false),
  lat: numeric("lat", { precision: 9, scale: 6 }),
  lng: numeric("lng", { precision: 9, scale: 6 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Users ---
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash"),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  active: boolean("active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  resetToken: text("reset_token"),
  resetTokenExpiresAt: timestamp("reset_token_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  emailIdx: uniqueIndex("users_email_idx").on(t.email),
}));

export const invitations = pgTable("invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").notNull().default("org_buyer"),
  token: text("token").notNull(),
  status: invitationStatusEnum("status").notNull().default("pending"),
  invitedByUserId: uuid("invited_by_user_id").references(() => users.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tokenIdx: uniqueIndex("invitations_token_idx").on(t.token),
}));

// --- Catalog ---
export const productCategories = pgTable("product_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  position: integer("position").notNull().default(0),
}, (t) => ({
  slugIdx: uniqueIndex("categories_slug_idx").on(t.slug),
}));

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").references(() => productCategories.id, { onDelete: "set null" }),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  unit: text("unit").notNull().default("unité"),
  origin: text("origin"),
  packaging: text("packaging"),
  indicativePrice: numeric("indicative_price", { precision: 10, scale: 2 }),
  storageInfo: text("storage_info"),
  validityInfo: text("validity_info"),
  specifications: text("specifications"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  skuIdx: uniqueIndex("products_sku_idx").on(t.sku),
  nameIdx: index("products_name_idx").on(t.name),
}));

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  position: integer("position").notNull().default(0),
});

export const productDocuments = pgTable("product_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  url: text("url").notNull(),
});

// --- Cart ---
export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  cartId: uuid("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
}, (t) => ({
  cartProductIdx: uniqueIndex("cart_items_cart_product_idx").on(t.cartId, t.productId),
}));

// --- Orders ---
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference").notNull(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  placedByUserId: uuid("placed_by_user_id").notNull().references(() => users.id),
  deliveryAddressId: uuid("delivery_address_id").references(() => deliveryAddresses.id),
  status: orderStatusEnum("status").notNull().default("submitted"),
  notes: text("notes"),
  estimatedDeliveryDate: timestamp("estimated_delivery_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  referenceIdx: uniqueIndex("orders_reference_idx").on(t.reference),
  orgIdx: index("orders_org_idx").on(t.organizationId),
}));

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  skuSnapshot: text("sku_snapshot").notNull(),
  unitSnapshot: text("unit_snapshot").notNull(),
  quantity: integer("quantity").notNull(),
  preparedQuantity: integer("prepared_quantity"),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  changedByUserId: uuid("changed_by_user_id").references(() => users.id),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Branding & notifications ---
export const brandingSettings = pgTable("branding_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#0F172A"),
  secondaryColor: text("secondary_color").notNull().default("#38BDF8"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const notificationRecipients = pgTable("notification_recipients", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  label: text("label"),
  active: boolean("active").notNull().default(true),
});

export const notificationEventSettings = pgTable("notification_event_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventKey: text("event_key").notNull(),
  label: text("label").notNull(),
  customerEmailEnabled: boolean("customer_email_enabled").notNull().default(true),
  opsEmailEnabled: boolean("ops_email_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  eventKeyIdx: uniqueIndex("notification_event_settings_key_idx").on(t.eventKey),
}));

// --- Email & activity logs ---
export const emailLogs = pgTable("email_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  toEmail: text("to_email").notNull(),
  template: text("template").notNull(),
  resendId: text("resend_id"),
  status: text("status").notNull().default("sent"),
  relatedOrderId: uuid("related_order_id").references(() => orders.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  actorLabel: text("actor_label"),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  summary: text("summary").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  createdAtIdx: index("activity_logs_created_at_idx").on(t.createdAt),
}));

// --- Client-facing notifications ---
export const clientNotificationCategoryEnum = pgEnum("client_notification_category", [
  "order_created",
  "order_status_updated",
  "system",
]);

export const clientNotifications = pgTable("client_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  category: clientNotificationCategoryEnum("category").notNull().default("system"),
  title: text("title").notNull(),
  body: text("body"),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdx: index("client_notifications_user_idx").on(t.userId),
}));
