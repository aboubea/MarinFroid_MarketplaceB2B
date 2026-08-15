export interface OrgPermissions {
  canOrder: boolean;
  canManageUsers: boolean;
  receivesOrderEmails: boolean;
}

const ROLE_DEFAULTS: Record<string, OrgPermissions> = {
  org_admin: { canOrder: true, canManageUsers: true, receivesOrderEmails: true },
  org_buyer: { canOrder: true, canManageUsers: false, receivesOrderEmails: false },
  org_viewer: { canOrder: false, canManageUsers: false, receivesOrderEmails: true },
};

const FALLBACK: OrgPermissions = { canOrder: false, canManageUsers: false, receivesOrderEmails: false };

// Users who can hold customizable permissions (canOrder / receivesOrderEmails).
// canManageUsers stays a hard org_admin boundary — it's never overridable,
// since it governs who can create/deactivate accounts in the org.
const OVERRIDABLE_KEYS: (keyof OrgPermissions)[] = ["canOrder", "receivesOrderEmails"];

export function roleDefaults(role: string): OrgPermissions {
  return ROLE_DEFAULTS[role] ?? FALLBACK;
}

export function getEffectivePermissions(user: { role: string; permissions?: string | null }): OrgPermissions {
  const base = roleDefaults(user.role);
  if (!user.permissions) return base;
  try {
    const overrides = JSON.parse(user.permissions) as Partial<OrgPermissions>;
    const result = { ...base };
    for (const key of OVERRIDABLE_KEYS) {
      if (typeof overrides[key] === "boolean") result[key] = overrides[key]!;
    }
    return result;
  } catch {
    return base;
  }
}

export function encodeOverrides(overrides: Partial<Pick<OrgPermissions, "canOrder" | "receivesOrderEmails">>): string {
  return JSON.stringify(overrides);
}
