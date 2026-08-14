import { Resend } from "resend";
export * from "./templates";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export function createEmailClient(apiKey: string) {
  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM ?? "Marin Froid <commandes@marinfroid.fr>";

  return {
    async send(params: SendEmailParams) {
      const result = await resend.emails.send({
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
      return result;
    },
  };
}

export type EmailClient = ReturnType<typeof createEmailClient>;
