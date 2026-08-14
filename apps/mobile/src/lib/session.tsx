import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, getToken, setToken as persistToken, clearToken } from "./api";

interface SessionUser {
  fullName: string;
  role: string;
  organizationName: string;
}

interface SessionContextValue {
  user: SessionUser | null;
  loading: boolean;
  signIn: (token: string, user: SessionUser) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken().then(async (token) => {
      if (token) {
        try {
          const me = await apiFetch<SessionUser>("/api/mobile/me");
          setUser(me);
        } catch {
          await clearToken();
        }
      }
      setLoading(false);
    });
  }, []);

  async function signIn(token: string, nextUser: SessionUser) {
    await persistToken(token);
    setUser(nextUser);
  }

  async function signOut() {
    await clearToken();
    setUser(null);
  }

  return (
    <SessionContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
