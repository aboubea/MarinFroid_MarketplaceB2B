import { emailLogs } from "@marin-froid/db";
import type { EmailClient, SendEmailParams } from "@marin-froid/email";
import { getDb } from "@/lib/db";

export async function sendTrackedEmail(
  emailClient: EmailClient,
  template: string,
  params: SendEmailParams & { relatedOrderId?: string },
) {
  const db = getDb();
  try {
    const result = await emailClient.send(params);
    await db.insert(emailLogs).values({
      toEmail: params.to,
      template,
      resendId: result.data?.id,
      status: result.error ? "failed" : "sent",
      relatedOrderId: params.relatedOrderId,
    });
    if (result.error) console.error("email error", result.error);
    return result;
  } catch (err) {
    console.error("email error", err);
    await db.insert(emailLogs).values({
      toEmail: params.to,
      template,
      status: "failed",
      relatedOrderId: params.relatedOrderId,
    });
    return null;
  }
}
