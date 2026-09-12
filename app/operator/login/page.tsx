"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function OperatorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [challenge, setChallenge] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch(challenge ? "/api/operator/session/verify" : "/api/operator/session/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(challenge ? { challenge_token: challenge, otp } : { email, password }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.detail ?? data.error ?? "Unable to sign in."); return; }
      if (data.requires_2fa) { setChallenge(data.challenge_token); return; }
      router.replace(data.user.role === "moderator" ? "/operator/reports" : "/operator/forensics");
      router.refresh();
    } catch { setError("The sign-in service is unavailable."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-slate-950 p-6 text-white flex items-center justify-center">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-slate-900 p-8 space-y-5">
      <h1 className="text-2xl font-semibold">Zuimi operator login</h1>
      {!challenge ? <><label className="block">Email<input className="mt-2 w-full rounded bg-white p-3 text-slate-950" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required /></label>
        <label className="block">Password<input className="mt-2 w-full rounded bg-white p-3 text-slate-950" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label></>
        : <label className="block">Email verification code<input className="mt-2 w-full rounded bg-white p-3 text-slate-950" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={event => setOtp(event.target.value)} required /></label>}
      {error && <p role="alert" className="text-red-300">{error}</p>}
      <button disabled={busy} className="rounded bg-blue-600 px-5 py-3 disabled:opacity-50">{busy ? "Signing in…" : challenge ? "Verify code" : "Sign in"}</button>
    </form>
  </main>;
}
