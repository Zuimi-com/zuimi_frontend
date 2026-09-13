"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Case = {
  id: string; post: string | null; comment: string | null;
  reason: string; details: string; created_at: string; decision: string;
  target: { title: string; body: string; removed: boolean; deleted: boolean; spoiler: boolean; type: string };
  author: { name: string; restricted: boolean; suspended: boolean };
};
type Page = { count: number; next: string | null; results: Case[] };
const actions = [
  ["dismiss", "Dismiss report"], ["remove_content", "Remove content"],
  ["restrict_user", "Restrict author"], ["suspend_user", "Suspend author"],
] as const;

export default function ReportQueue() {
  const [cases, setCases] = useState<Case[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"pending" | "resolved">("pending");
  const [selected, setSelected] = useState<string | null>(null);
  const [decision, setDecision] = useState("dismiss");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch(`/api/operator/backend/community/report-review?status=${status}&page=${page}`, { cache: "no-store" });
    if (!response.ok) { setError("Could not load reports. Please sign in again."); return; }
    const data = await response.json() as Page;
    setCases(data.results); setCount(data.count); setError("");
  }, [page, status]);
  useEffect(() => { void load(); }, [load]);

  async function decide(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/operator/backend/community/report-review/${selected}/decide`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reason }),
      });
      if (!response.ok) { const data = await response.json(); setError(data.detail ?? JSON.stringify(data)); return; }
      setSelected(null); setReason(""); await load();
    } catch { setError("The review could not be saved."); }
    finally { setBusy(false); }
  }

  return <main className="mx-auto max-w-5xl p-6 space-y-6">
    <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold">Reported content</h1><p>{count} {status} reports</p></div>
      <select aria-label="Report status" className="rounded border p-2" value={status} onChange={event => { setStatus(event.target.value as "pending" | "resolved"); setPage(1); }}><option value="pending">Pending</option><option value="resolved">Resolved</option></select>
    </div>
    {error && <p role="alert" className="rounded bg-red-100 p-3 text-red-900">{error}</p>}
    {cases.length === 0 && <p className="rounded bg-white p-6">No reports on this page.</p>}
    {cases.map(item => <article key={item.id} className="rounded-xl bg-white p-6 shadow-sm space-y-3">
      <div className="flex justify-between gap-4"><h2 className="font-semibold">{item.target.type === "post" ? "Post" : "Comment"} · {item.reason}</h2><time className="text-sm text-slate-600">{new Date(item.created_at).toLocaleString()}</time></div>
      <p className="text-sm">By {item.author.name}{item.author.restricted ? " · Restricted" : ""}{item.author.suspended ? " · Suspended" : ""}</p>
      {item.target.title && <h3 className="font-medium">{item.target.title}</h3>}
      <p className="whitespace-pre-wrap break-words">{item.target.body}</p>
      <p className="text-sm text-slate-600">{item.target.removed ? "Removed · " : ""}{item.target.deleted ? "Deleted · " : ""}{item.target.spoiler ? "Spoiler · " : ""}Report details: {item.details || "None supplied"}</p>
      {status === "pending" ? <button className="rounded bg-slate-950 px-4 py-2 text-white" onClick={() => { setSelected(item.id); setDecision("dismiss"); }}>Review</button> : <p className="text-sm font-medium">Decision: {item.decision}</p>}
    </article>)}
    <div className="flex gap-4"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page}</span><button disabled={page * 20 >= count} onClick={() => setPage(page + 1)}>Next</button></div>
    {selected && <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Review report"><form onSubmit={decide} className="w-full max-w-lg rounded-xl bg-white p-6 space-y-4">
      <h2 className="text-xl font-semibold">Review report</h2><p>Give a specific rule or evidence reason. Criticism of a film alone is not a violation.</p>
      <label className="block">Action<select className="mt-1 w-full rounded border p-2" value={decision} onChange={event => setDecision(event.target.value)}>{actions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="block">Reason<textarea className="mt-1 w-full rounded border p-2" minLength={10} maxLength={2000} required value={reason} onChange={event => setReason(event.target.value)} /></label>
      <div className="flex gap-3"><button disabled={busy} className="rounded bg-blue-600 px-4 py-2 text-white">{busy ? "Saving…" : "Confirm decision"}</button><button type="button" onClick={() => setSelected(null)}>Cancel</button></div>
    </form></div>}
  </main>;
}
