export interface SafeFetchResult<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
  networkError: boolean;
}

export async function safeFetch<T = unknown>(input: string, init?: RequestInit): Promise<SafeFetchResult<T>> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    return { ok: false, data: null, error: "Connexion impossible. Vérifiez votre réseau et réessayez.", networkError: true };
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data as { error?: string } | null)?.error ?? "Une erreur est survenue. Réessayez.";
    return { ok: false, data: null, error: message, networkError: false };
  }

  return { ok: true, data: data as T, error: null, networkError: false };
}
