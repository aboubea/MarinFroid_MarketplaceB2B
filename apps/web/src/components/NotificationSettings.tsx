"use client";

import { useEffect, useState } from "react";

interface EventSetting {
  id: string;
  eventKey: string;
  label: string;
  customerEmailEnabled: boolean;
  opsEmailEnabled: boolean;
}

interface Recipient {
  id: string;
  email: string;
  label: string | null;
  active: boolean;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 38,
        height: 22,
        borderRadius: 999,
        border: "none",
        background: checked ? "var(--color-primary)" : "var(--color-border-strong)",
        position: "relative",
        transition: "background 0.15s var(--ease)",
        flexShrink: 0,
      }}
      aria-pressed={checked}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.15s var(--ease)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

export function NotificationSettings() {
  const [events, setEvents] = useState<EventSetting[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    fetch("/api/admin/notifications/events").then((r) => r.json()).then((d) => setEvents(d.events));
    fetch("/api/admin/notifications/recipients").then((r) => r.json()).then((d) => setRecipients(d.recipients));
  }, []);

  async function updateEvent(id: string, patch: Partial<EventSetting>) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    const event = events.find((e) => e.id === id);
    if (!event) return;
    await fetch("/api/admin/notifications/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, customerEmailEnabled: event.customerEmailEnabled, opsEmailEnabled: event.opsEmailEnabled, ...patch }),
    });
  }

  async function addRecipient(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail) return;
    const res = await fetch("/api/admin/notifications/recipients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, label: newLabel }),
    });
    if (res.ok) {
      const { recipient } = await res.json();
      setRecipients((prev) => [...prev, recipient]);
      setNewEmail("");
      setNewLabel("");
    }
  }

  async function toggleRecipient(id: string, active: boolean) {
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, active } : r)));
    await fetch(`/api/admin/notifications/recipients/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  }

  async function deleteRecipient(id: string) {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/admin/notifications/recipients/${id}`, { method: "DELETE" });
  }

  return (
    <div>
      <div className="card fade-up" style={{ overflow: "hidden", marginBottom: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", padding: "12px 20px", fontSize: 11.5, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--color-border)" }}>
          <span>Événement</span>
          <span>Email client</span>
          <span>Email équipe</span>
        </div>
        {events.map((ev, idx) => (
          <div
            key={ev.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 140px 140px",
              alignItems: "center",
              padding: "14px 20px",
              borderBottom: idx < events.length - 1 ? "1px solid var(--color-border)" : "none",
            }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>{ev.label}</span>
            <Toggle checked={ev.customerEmailEnabled} onChange={(v) => updateEvent(ev.id, { customerEmailEnabled: v })} />
            <Toggle checked={ev.opsEmailEnabled} onChange={(v) => updateEvent(ev.id, { opsEmailEnabled: v })} />
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 15, marginBottom: 12 }}>Destinataires équipe Marin Froid</h2>
      <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>
        {recipients.length === 0 && (
          <div style={{ padding: 16, color: "var(--color-text-muted)", fontSize: 13 }}>Aucun destinataire configuré.</div>
        )}
        {recipients.map((r, idx) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: idx < recipients.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{r.email}</div>
              {r.label && <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{r.label}</div>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Toggle checked={r.active} onChange={(v) => toggleRecipient(r.id, v)} />
              <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => deleteRecipient(r.id)}>Retirer</button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={addRecipient} style={{ display: "flex", gap: 8 }}>
        <input className="input" placeholder="email@marinfroid.fr" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        <input className="input" placeholder="Libellé (optionnel)" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} style={{ maxWidth: 200 }} />
        <button className="btn-primary" type="submit">Ajouter</button>
      </form>
    </div>
  );
}
