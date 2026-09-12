"use client";

import { useState } from "react";

export default function ForensicsLaunch() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function openConsole() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/operator/backend/operators/forensics-ticket", { method: "POST" });
      const data = await response.json();
      if (!response.ok) { setError(data.detail ?? "Forensics is unavailable."); return; }
      const form = document.createElement("form");
      form.method = "POST"; form.action = data.url;
      const input = document.createElement("input"); input.type = "hidden"; input.name = "ticket"; input.value = data.ticket;
      form.append(input); document.body.append(form); form.submit();
    } catch { setError("Could not open the forensics console."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-3xl p-8 space-y-5"><h1 className="text-2xl font-bold">Forensics investigations</h1>
    <p>Open the restricted evidence and attribution console with your Zuimi operator account.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <button disabled={busy} onClick={openConsole} className="rounded bg-blue-600 px-5 py-3 text-white disabled:opacity-50">{busy ? "Opening…" : "Open forensics console"}</button>
  </main>;
}
