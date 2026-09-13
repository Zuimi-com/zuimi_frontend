import "server-only";

import { cookies } from "next/headers";
import { getApiBaseUrl } from "@/lib/get-api-base-url";

const accessName = "zuimi_operator_access";
const refreshName = "zuimi_operator_refresh";
const options = (maxAge: number) => ({
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const,
  path: "/", maxAge,
});

export async function setOperatorSession(access: string, refresh: string) {
  const store = await cookies();
  store.set(accessName, access, options(15 * 60));
  store.set(refreshName, refresh, options(30 * 24 * 60 * 60));
}

export async function clearOperatorSession() {
  const store = await cookies();
  store.delete(accessName);
  store.delete(refreshName);
}

async function refreshAccess(): Promise<string | null> {
  const refresh = (await cookies()).get(refreshName)?.value;
  if (!refresh) return null;
  const response = await fetch(`${getApiBaseUrl()}/token/generate-access-token/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }), cache: "no-store",
  });
  if (!response.ok) return null;
  const tokens = await response.json() as { access?: string; refresh?: string };
  if (!tokens.access) return null;
  await setOperatorSession(tokens.access, tokens.refresh ?? refresh);
  return tokens.access;
}

export async function operatorFetch(path: string, init: RequestInit = {}) {
  const store = await cookies();
  let access = store.get(accessName)?.value ?? await refreshAccess();
  if (!access) return new Response(JSON.stringify({ detail: "Sign in required." }), { status: 401 });
  const request = (token: string) => fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: { ...Object.fromEntries(new Headers(init.headers).entries()), Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  let response = await request(access);
  if (response.status === 401) {
    access = await refreshAccess();
    if (access) response = await request(access);
  }
  return response;
}

export async function operatorIdentity() {
  const response = await operatorFetch("/operators/session/");
  if (!response.ok) return null;
  const data = await response.json() as { user: { id: string; email: string; role: "moderator" | "cto" } };
  return data.user;
}
