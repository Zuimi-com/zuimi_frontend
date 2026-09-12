"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

export default function OperatorSetup() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    setToken(new URLSearchParams(location.hash.slice(1)).get("token") ?? "");
    history.replaceState(null, "", location.pathname);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/operator/setup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    setMessage(response.ok ? `Your ${data.role} account is ready.` : JSON.stringify(data));
    if (response.ok) setComplete(true);
  }
  return <main className="min-h-screen bg-slate-950 p-6 text-white flex items-center justify-center">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-slate-900 p-8 space-y-5">
      <h1 className="text-2xl font-semibold">Set up your Zuimi operator account</h1>
      {!token && !complete && <p role="alert">Open the invitation link in your email to continue.</p>}
      {!complete && <label className="block">Password (at least 12 characters)
        <input className="mt-2 w-full rounded bg-white p-3 text-slate-950" type="password" autoComplete="new-password" minLength={12} value={password} onChange={event => setPassword(event.target.value)} required />
      </label>}
      {message && <p role="status">{message}</p>}
      {!complete && <button disabled={!token} className="rounded bg-blue-600 px-5 py-3 disabled:opacity-50">Activate account</button>}
      {complete && <Link className="text-blue-300 underline" href="/operator/login">Go to operator login</Link>}
    </form>
  </main>;
}
