"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

export function InviteClientForm() {
  const router = useRouter();
  const toast = useToast();
  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const result = await safeFetch("/api/admin/clients/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgName, contactEmail, contactName }),
    });
    setSending(false);
    if (result.ok) {
      setOrgName("");
      setContactEmail("");
      setContactName("");
      toast.show("Invitation envoyée.", "success");
      router.refresh();
    } else {
      toast.show(result.error ?? "Erreur lors de l'envoi.", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) auto", gap: 8, alignItems: "start" }}>
      <input className="input" placeholder="Nom de la société" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
      <input className="input" placeholder="Nom du contact" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
      <input className="input" type="email" placeholder="Email du contact" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
      <button className="btn-primary" type="submit" disabled={sending}>
        {sending ? "Envoi..." : "Inviter"}
      </button>
    </form>
  );
}
