function layout(title: string, body: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
      <tr><td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#0F172A;padding:24px 32px;">
            <span style="color:#FFFFFF;font-size:18px;font-weight:600;letter-spacing:0.02em;">Marin Froid</span>
          </td></tr>
          <tr><td style="padding:32px;">
            <h1 style="font-size:18px;color:#0F172A;margin:0 0 16px;">${title}</h1>
            <div style="font-size:14px;line-height:1.6;color:#334155;">${body}</div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function invitationEmail(params: { organizationName: string; activationUrl: string }) {
  return {
    subject: `Invitation à rejoindre le portail Marin Froid`,
    html: layout(
      "Vous êtes invité(e)",
      `<p>Vous avez été invité(e) à rejoindre le portail de commande privé Marin Froid pour <strong>${params.organizationName}</strong>.</p>
       <p><a href="${params.activationUrl}" style="display:inline-block;background:#0F172A;color:#FFFFFF;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Activer mon compte</a></p>`
    ),
  };
}

export function accountActivatedEmail(params: { fullName: string; loginUrl: string }) {
  return {
    subject: `Votre compte Marin Froid est actif`,
    html: layout(
      "Compte activé",
      `<p>Bonjour ${params.fullName}, votre compte est désormais actif.</p>
       <p><a href="${params.loginUrl}" style="color:#0F172A;font-weight:600;">Se connecter</a></p>`
    ),
  };
}

export function passwordResetEmail(params: { resetUrl: string }) {
  return {
    subject: `Réinitialisation de votre mot de passe`,
    html: layout(
      "Réinitialiser le mot de passe",
      `<p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans 1 heure.</p>
       <p><a href="${params.resetUrl}" style="display:inline-block;background:#0F172A;color:#FFFFFF;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Réinitialiser</a></p>`
    ),
  };
}

export function orderCreatedEmail(params: {
  reference: string;
  organizationName: string;
  orderUrl: string;
  isForOps: boolean;
  items: { name: string; sku: string; quantity: number; unit: string }[];
  estimatedDeliveryDate?: string | null;
  deliveryAddress?: string | null;
  notes?: string | null;
}) {
  const itemRows = params.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #E2E8F0;">${i.name} <span style="color:#94A3B8;">(${i.sku})</span></td>
             <td style="padding:6px 0;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:700;white-space:nowrap;">× ${i.quantity} ${i.unit}</td></tr>`
    )
    .join("");
  const itemTable = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0;font-size:13px;">${itemRows}</table>`;

  // The ops (preparer) recipients only ever get this email — they have no
  // login to click through to, so the order content itself needs to be in
  // the email body rather than just a link.
  const opsBody = `<p>Nouvelle commande de <strong>${params.organizationName}</strong> à préparer.</p>
       <p>Référence : <strong>${params.reference}</strong></p>
       ${itemTable}
       ${params.deliveryAddress ? `<p><strong>Livraison —</strong> ${params.deliveryAddress}</p>` : ""}
       ${params.estimatedDeliveryDate ? `<p><strong>Livraison estimée —</strong> ${params.estimatedDeliveryDate}</p>` : ""}
       ${params.notes ? `<p><strong>Notes —</strong> ${params.notes}</p>` : ""}`;

  const customerBody = `<p>Votre commande a bien été transmise à l'équipe Marin Froid et est en cours de préparation.</p>
       <p>Référence : <strong>${params.reference}</strong></p>
       ${itemTable}
       ${params.estimatedDeliveryDate ? `<p><strong>Livraison estimée —</strong> ${params.estimatedDeliveryDate}</p>` : ""}
       <p><a href="${params.orderUrl}" style="color:#0F172A;font-weight:600;">Voir la commande</a></p>`;

  return {
    subject: `Commande ${params.reference} ${params.isForOps ? "reçue" : "confirmée"}`,
    html: layout(params.isForOps ? "Nouvelle commande reçue" : "Commande confirmée", params.isForOps ? opsBody : customerBody),
  };
}

const STATUS_LABELS_FR: Record<string, string> = {
  submitted: "reçue",
  acknowledged: "confirmée",
  processing: "en préparation",
  shipped: "expédiée",
  completed: "livrée",
  cancelled: "annulée",
};

export function orderStatusUpdatedEmail(params: { reference: string; status: string; orderUrl: string; estimatedDeliveryDate?: string | null }) {
  const label = STATUS_LABELS_FR[params.status] ?? params.status;
  return {
    subject: `Commande ${params.reference} — statut mis à jour`,
    html: layout(
      "Statut de commande mis à jour",
      `<p>La commande <strong>${params.reference}</strong> est maintenant : <strong>${label}</strong>.</p>
       ${params.estimatedDeliveryDate ? `<p>Livraison estimée : <strong>${params.estimatedDeliveryDate}</strong></p>` : ""}
       <p><a href="${params.orderUrl}" style="color:#0F172A;font-weight:600;">Voir la commande</a></p>`
    ),
  };
}

