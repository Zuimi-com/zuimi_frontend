"use client";

import { FormEvent, useEffect, useState } from "react";

type Operator = { id: string; email: string; role: "moderator" | "cto"; enabled: boolean; active: boolean };

export default function OperatorsPage() {
  const [accounts, setAccounts] = useState<Operator[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Operator["role"]>("moderator");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/backend/operators", { cache: "no-store" });
    if (!response.ok) { setMessage("Operator management requires a superuser or the operator management permission."); return; }
    setAccounts(await response.json());
  }
  useEffect(() => { void load(); }, []);

  async function invite(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/backend/operators", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await response.json();
      if (!response.ok) { setMessage(JSON.stringify(data)); return; }
      setMessage(`Invitation emailed to ${data.email}. The link expires in 24 hours.`);
      setEmail(""); await load();
    } catch { setMessage("Invitation could not be sent."); }
    finally { setBusy(false); }
  }

  async function changeState(account: Operator) {
    const response = await fetch(`/api/admin/backend/operators/${account.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !account.enabled }),
    });
    if (!response.ok) { setMessage("Could not update this account."); return; }
    await load();
  }

  return <div className="mx-auto max-w-4xl space-y-8">
    <div><h1 className="text-2xl font-semibold">Operator accounts</h1><p>Invite report moderators or the CTO. Each person sets their own password using a single-use email link.</p></div>
    {message && <p role="status" className="rounded bg-blue-50 p-3">{message}</p>}
    <form onSubmit={invite} className="rounded-xl bg-white p-6 shadow space-y-4">
      <h2 className="text-lg font-semibold">Invite an operator</h2>
      <label className="block">Email<input className="mt-1 w-full rounded border p-2" type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
      <label className="block">Role<select className="mt-1 w-full rounded border p-2" value={role} onChange={event => setRole(event.target.value as Operator["role"])}><option value="moderator">Report moderator</option><option value="cto">CTO — forensics</option></select></label>
      <button disabled={busy} className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-50">{busy ? "Sending…" : "Send invitation"}</button>
    </form>
    <section className="rounded-xl bg-white p-6 shadow space-y-4"><h2 className="text-lg font-semibold">Accounts</h2>
      {accounts.length === 0 && <p>No operators invited yet.</p>}
      {accounts.map(account => <div key={account.id} className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div><strong>{account.email}</strong><p className="text-sm">{account.role} · {account.enabled ? account.active ? "Active" : "Invitation pending" : "Disabled"}</p></div>
        <button className="rounded border px-3 py-2" onClick={() => changeState(account)}>{account.enabled ? "Disable" : "Enable"}</button>
      </div>)}
    </section>
  </div>;
}
