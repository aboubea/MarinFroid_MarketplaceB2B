"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "./Avatar";
import { IconSearch } from "./icons";
import { EmptyState } from "./EmptyState";

interface Organization {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  invited: "Invitée",
  suspended: "Suspendue",
};

const STATUS_BADGE: Record<string, string> = {
  active: "badge-completed",
  invited: "badge-submitted",
  suspended: "badge-cancelled",
};

export function ClientsTable({ organizations }: { organizations: Organization[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return organizations;
    return organizations.filter((o) => o.name.toLowerCase().includes(q));
  }, [organizations, query]);

  return (
    <div>
      <div className="search-input-wrap" style={{ marginBottom: 16 }}>
        <IconSearch />
        <input className="input" placeholder="Rechercher une société..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <EmptyState illustration="search" title="Aucun résultat" description="Aucune société ne correspond à cette recherche." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Société</th>
                  <th>Créée le</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/clients/${o.id}`} style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                        <Avatar name={o.name} />
                        {o.name}
                      </Link>
                    </td>
                    <td style={{ color: "var(--color-text-muted)" }}>{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[o.status] ?? "badge-submitted"}`}>{STATUS_LABELS[o.status] ?? o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
