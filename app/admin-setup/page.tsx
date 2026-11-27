"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { adminError } from "@/features/dashboard/permissions";

export default function AdminSetup() {
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(location.hash.slice(1)).get("token") ?? "");
    history.replaceState(null, "", location.pathname);
  }, []);

  async function activate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(adminError(data));
      setComplete(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "The account could not be activated.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <form onSubmit={activate} className="w-full max-w-md space-y-5 rounded-2xl bg-slate-900 p-8">
        <h1 className="text-2xl font-semibold">Set up your Zuimi admin account</h1>
        {complete ? (
          <Link className="text-blue-300 underline" href="/admin-login">Sign in to the dashboard</Link>
        ) : (
          <>
            {token === "" && <p role="alert">Open the invitation link from your work email.</p>}
            <label className="block">
              Password
              <input className="mt-2 block w-full rounded bg-white p-3 text-slate-950" name="password"
                type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
            </label>
            <p className="text-sm text-slate-300">Use at least 12 characters.</p>
            <button disabled={!token || busy} className="rounded bg-blue-600 px-5 py-3 disabled:opacity-50">
              {busy ? "Activating…" : "Activate account"}
            </button>
          </>
        )}
        {error && <p role="alert" className="text-red-200">{error}</p>}
      </form>
    </main>
  );
}
