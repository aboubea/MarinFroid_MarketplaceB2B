import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { notificationEventSettings } from "@marin-froid/db";

export type NotificationEventKey = "order_created" | "order_status_updated" | "invitation_sent" | "account_activated" | "password_reset";

export async function isNotificationEnabled(eventKey: NotificationEventKey, audience: "customer" | "ops"): Promise<boolean> {
  const db = getDb();
  const setting = await db.query.notificationEventSettings.findFirst({
    where: eq(notificationEventSettings.eventKey, eventKey),
  });
  if (!setting) return true;
  return audience === "customer" ? setting.customerEmailEnabled : setting.opsEmailEnabled;
}
