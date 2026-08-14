const STEPS = ["submitted", "acknowledged", "processing", "shipped", "completed"];
const LABELS: Record<string, string> = {
  submitted: "Reçue",
  acknowledged: "Confirmée",
  processing: "Préparation",
  shipped: "Expédiée",
  completed: "Livrée",
};

export function StatusTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="card" style={{ padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <span className="badge badge-cancelled">Annulée</span>
        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Cette commande a été annulée.</span>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {STEPS.map((step, idx) => {
          const done = idx <= currentIndex;
          return (
            <div key={step} style={{ display: "flex", alignItems: "center", flex: idx < STEPS.length - 1 ? 1 : "0 0 auto" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: done ? "var(--color-primary)" : "var(--color-border-strong)",
                    transition: "background 0.2s var(--ease)",
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: done ? "var(--color-text)" : "var(--color-text-faint)", whiteSpace: "nowrap" }}>
                  {LABELS[step]}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: idx < currentIndex ? "var(--color-primary)" : "var(--color-border)", margin: "0 6px 18px" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
