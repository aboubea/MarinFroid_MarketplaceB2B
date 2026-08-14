import { getDb } from "./db";
import { activityLogs, clientNotifications } from "@marin-froid/db";

export async function logActivity(params: {
  actorUserId?: string | null;
  actorLabel?: string | null;
  organizationId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
}) {
  const db = getDb();
  await db.insert(activityLogs).values({
    actorUserId: params.actorUserId ?? null,
    actorLabel: params.actorLabel ?? null,
    organizationId: params.organizationId ?? null,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    summary: params.summary,
  });
}

export async function notifyUser(params: {
  userId: string;
  organizationId: string;
  category: "order_created" | "order_status_updated" | "system";
  title: string;
  body?: string | null;
  orderId?: string | null;
}) {
  const db = getDb();
  await db.insert(clientNotifications).values({
    userId: params.userId,
    organizationId: params.organizationId,
    category: params.category,
    title: params.title,
    body: params.body ?? null,
    orderId: params.orderId ?? null,
  });
}
