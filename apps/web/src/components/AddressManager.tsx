"use client";

import { useState } from "react";

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", line1: "", line2: "", city: "", postalCode: "", country: "FR", isDefault: false });
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const { address } = await res.json();
      setAddresses((prev) => (form.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev).concat(address));
      setForm({ label: "", line1: "", line2: "", city: "", postalCode: "", country: "FR", isDefault: false });
      setShowForm(false);
    }
  }

  async function handleDelete(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
  }

  return (
    <div>
      {addresses.length === 0 && !showForm && (
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 12 }}>Aucune adresse de livraison enregistrée.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {addresses.map((a) => (
          <div key={a.id} className="card" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                {a.label} {a.isDefault && <span className="badge badge-completed" style={{ marginLeft: 6 }}>par défaut</span>}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                {a.line1}{a.line2 ? `, ${a.line2}` : ""} · {a.postalCode} {a.city} · {a.country}
              </div>
            </div>
            <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => handleDelete(a.id)}>
              Supprimer
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <form onSubmit={handleAdd} className="card fade-up" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <input className="input" placeholder="Nom (ex. Entrepôt principal)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
          <input className="input" placeholder="Adresse" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
          <input className="input" placeholder="Complément (optionnel)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input className="input" placeholder="Code postal" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} required />
            <input className="input" placeholder="Ville" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-text-muted)" }}>
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Définir comme adresse par défaut
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Ajout..." : "Ajouter"}</button>
            <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </form>
      ) : (
        <button className="btn-secondary" onClick={() => setShowForm(true)}>+ Ajouter une adresse</button>
      )}
    </div>
  );
}
