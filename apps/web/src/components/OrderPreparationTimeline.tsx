interface HistoryEntry {
  status: string;
  createdAt: string;
}

interface Step {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const ICONS = {
  received: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  ),
  confirmed: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  preparing: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  ),
  shipped: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="14" height="11" rx="1.5" />
      <path d="M15 10h4l3 3.5V17h-7z" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="17.5" cy="19" r="2" />
    </svg>
  ),
  delivered: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
};

const STEPS: Step[] = [
  { key: "submitted", title: "Commande reçue", subtitle: "En attente de confirmation", icon: ICONS.received },
  { key: "acknowledged", title: "Confirmée", subtitle: "Prise en charge par l'équipe", icon: ICONS.confirmed },
  { key: "processing", title: "Préparation", subtitle: "Constitution de la commande", icon: ICONS.preparing },
  { key: "shipped", title: "Expédiée", subtitle: "En cours de livraison", icon: ICONS.shipped },
  { key: "completed", title: "Livrée", subtitle: "Commande finalisée", icon: ICONS.delivered },
];

const SUMMARY_LABEL: Record<string, string> = {
  submitted: "En attente de confirmation par l'équipe Marin Froid",
  acknowledged: "Commande confirmée, préparation à venir",
  processing: "Commande en cours de préparation",
  shipped: "Commande expédiée, livraison en cours",
  completed: "Commande livrée",
  cancelled: "Commande annulée",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function OrderPreparationTimeline({
  status,
  history,
  estimatedDeliveryDate,
}: {
  status: string;
  history: HistoryEntry[];
  estimatedDeliveryDate?: string | null;
}) {
  if (status === "cancelled") {
    return (
      <div className="card" style={{ padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <span className="badge badge-cancelled">Annulée</span>
        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Cette commande a été annulée.</span>
      </div>
    );
  }

  const dateByStatus = new Map(history.map((h) => [h.status, h.createdAt]));
  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="card order-timeline-card" style={{ padding: "28px 24px 20px" }}>
      <div className="order-timeline-row">
        {STEPS.map((step, idx) => {
          const done = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const date = dateByStatus.get(step.key);
          const showEstimate = !date && step.key === "completed" && !done && !!estimatedDeliveryDate;
          return (
            <div key={step.key} className="order-timeline-item" style={{ flex: idx < STEPS.length - 1 ? 1 : "0 0 auto" }}>
              <div className="order-timeline-step">
                <div className="order-timeline-step-main">
                  <div
                    className="order-timeline-dot"
                    style={{
                      background: done ? "var(--color-success)" : "var(--color-surface)",
                      border: done ? "none" : "2px solid var(--color-border-strong)",
                      color: done ? "#fff" : "var(--color-text-faint)",
                      boxShadow: isCurrent ? "0 0 0 4px rgba(22,163,74,0.15)" : "none",
                    }}
                  >
                    {step.icon}
                  </div>
                  <div className="order-timeline-text">
                    <div className="order-timeline-title-row">
                      <span className="order-timeline-title">{step.title}</span>
                      {date && <span className="order-timeline-date" style={{ color: done ? "var(--color-success)" : "var(--color-text-faint)" }}>{formatDate(date)}</span>}
                      {showEstimate && (
                        <span className="order-timeline-date order-timeline-date-estimate">
                          est. {formatDate(estimatedDeliveryDate!)}
                        </span>
                      )}
                    </div>
                    <div className="order-timeline-subtitle">{step.subtitle}</div>
                  </div>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className="order-timeline-connector"
                  style={{ background: idx < currentIndex ? "var(--color-success)" : "var(--color-border)" }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--color-border)", color: "var(--color-text-muted)", fontSize: 13 }}>
        <span style={{ color: "var(--color-success)" }}>{ICONS.clock}</span>
        {SUMMARY_LABEL[status] ?? status}
      </div>
    </div>
  );
}
