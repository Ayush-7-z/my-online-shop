// Single entry point for backend calls. Always resolves (never throws) with the parsed JSON
// plus the HTTP status, so callers just check `.success` / `.error`.
// Same-origin "/api" by default (Vite proxies it in dev); set VITE_API_URL to call another origin.
const BASE = import.meta.env.VITE_API_URL ?? "";

export const SESSION_EXPIRED = "auth:expired";

export async function api(path, { method = "GET", body } = {}) {
  try {
    const res = await fetch(`${BASE}/api/${path}`, {
      method,
      credentials: "include", // session cookie
      headers: {
        "X-Requested-With": "fetch", // required by the API's CSRF guard on non-GET requests
        ...(body && { "Content-Type": "application/json" }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = { ...(await res.json()), status: res.status };
    // A 401 anywhere except the login/register forms means the session ended: sign the UI out.
    if (res.status === 401 && !/^(login|register)\.php/.test(path)) window.dispatchEvent(new Event(SESSION_EXPIRED));
    return data;
  } catch {
    return { success: false, status: 0, error: "Could not connect to the server. Please try again." };
  }
}
