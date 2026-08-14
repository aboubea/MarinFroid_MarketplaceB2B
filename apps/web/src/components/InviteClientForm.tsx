"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function InviteClientForm() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/admin/clients/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgName, contactEmail, contactName }),
    });
    if (res.ok) {
      setStatus("sent");
      setOrgName("");
      setContactEmail("");
      setContactName("");
      router.refresh();
    } else {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) auto", gap: 8, alignItems: "start" }}>
      <input className="input" placeholder="Nom de la société" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
      <input className="input" placeholder="Nom du contact" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
      <input className="input" type="email" placeholder="Email du contact" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
      <button className="btn-primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Envoi..." : "Inviter"}
      </button>
      {status === "sent" && <p style={{ gridColumn: "1 / -1", color: "var(--color-success)", fontSize: 13 }}>Invitation envoyée.</p>}
      {status === "error" && <p style={{ gridColumn: "1 / -1", color: "var(--color-danger)", fontSize: 13 }}>Erreur lors de l'envoi.</p>}
    </form>
  );
}
