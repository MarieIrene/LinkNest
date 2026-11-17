export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fields: Record<string, string> };

/** Small fetch wrapper for the browser that always resolves to a result object. */
export async function apiRequest<T>(
  url: string,
  opts: { method?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: opts.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && !url.startsWith("/api/auth/")) {
      window.location.href = "/login";
    }
    if (!res.ok) {
      return {
        ok: false,
        error: data.error ?? "Something went wrong. Try again.",
        fields: data.fields ?? {},
      };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again.", fields: {} };
  }
}
