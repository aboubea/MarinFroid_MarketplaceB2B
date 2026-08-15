"use client";

import { useState } from "react";
import { InviteClientForm } from "./InviteClientForm";
import { AdminClientsBoard, type OrgRow } from "./AdminClientsBoard";
import { InvitationsTable } from "./InvitationsTable";

const TABS = [
  { key: "clients", label: "Sociétés" },
  { key: "invitations", label: "Invitations" },
] as const;

export function AdminClientsTabs({ initialOrganizations }: { initialOrganizations: OrgRow[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("clients");

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map((t) => (
          <button key={t.key} className={`pill-filter ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "clients" ? (
        <>
          <div className="card" style={{ padding: 20, marginBottom: 32 }}>
            <h2 className="section-title">Inviter une nouvelle société</h2>
            <InviteClientForm />
          </div>
          <AdminClientsBoard initialOrganizations={initialOrganizations} />
        </>
      ) : (
        <InvitationsTable />
      )}
    </div>
  );
}
