import "server-only";

import { cookies } from "next/headers";

import { getApiBaseUrl } from "@/lib/get-api-base-url";

const ACCESS_COOKIE = "zuimi_admin_access";
const REFRESH_COOKIE = "zuimi_admin_refresh";

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge,
});

const backendUrl = (path: string) =>
  `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

export async function setAdminSession(access: string, refresh: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, access, cookieOptions(15 * 60));
  store.set(REFRESH_COOKIE, refresh, cookieOptions(30 * 24 * 60 * 60));
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

async function refreshAdminSession(): Promise<string | null> {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;

  const response = await fetch(backendUrl("/token/generate-access-token/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
  });

  if (!response.ok) {
    await clearAdminSession();
    return null;
  }

  const tokens = (await response.json()) as { access?: string; refresh?: string };
  if (!tokens.access) {
    await clearAdminSession();
    return null;
  }

  await setAdminSession(tokens.access, tokens.refresh ?? refresh);
  return tokens.access;
}

export async function fetchWithAdminSession(path: string, init: RequestInit = {}) {
  const store = await cookies();
  let access: string | null | undefined = store.get(ACCESS_COOKIE)?.value;
  if (!access) {
    access = await refreshAdminSession();
  }
  if (!access) {
    return new Response(JSON.stringify({ detail: "Admin session required." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const request = (token: string) =>
    fetch(backendUrl(path), {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init.headers).entries()),
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

  let response = await request(access);
  if (response.status === 401) {
    const refreshed = await refreshAdminSession();
    if (!refreshed) return response;
    response = await request(refreshed);
  }
  return response;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
}
