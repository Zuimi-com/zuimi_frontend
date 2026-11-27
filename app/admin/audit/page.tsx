"use client";

import { useEffect, useState } from "react";
import { adminError } from "@/features/dashboard/permissions";

type AuditEvent = { id: number; actor: string | null; action: string; target: string; details: object; created_at: string };
type Page = { events: AuditEvent[]; next_before: number | null };

export default function AdminAuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(before?: number) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/backend/dashboard-admins/audit${before ? `?before=${before}` : ""}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(adminError(body));
      const page = body as Page;
      setEvents(current => before ? [...current, ...page.events] : page.events);
      setCursor(page.next_before);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Audit history could not be loaded.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load(); }, []);

  return (
    <section className="mx-auto max-w-6xl space-y-4 text-slate-950">
      <h1 className="text-3xl font-semibold tracking-tight">Audit history</h1>
      {error && <p role="alert" className="text-red-800">{error}</p>}
      {!loading && !error && events.length === 0 && <p>No admin actions have been recorded.</p>}
      {events.length > 0 && <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50"><tr>
            <th scope="col" className="px-4 py-3">When</th>
            <th scope="col" className="px-4 py-3">Admin</th>
            <th scope="col" className="px-4 py-3">Action</th>
            <th scope="col" className="px-4 py-3">Details</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {events.map(event => <tr key={event.id} className="align-top">
              <td className="whitespace-nowrap px-4 py-3"><time dateTime={event.created_at}>{new Date(event.created_at).toLocaleString()}</time></td>
              <td className="px-4 py-3">{event.actor ?? "Former admin"}</td>
              <td className="px-4 py-3">{event.action.replace(/[._-]/g, " ")}</td>
              <td className="px-4 py-3">
                {event.target && <span className="break-all text-xs text-slate-600">{event.target}</span>}
                {Object.keys(event.details).length > 0 && <details>
                  <summary className="cursor-pointer text-blue-800">View details</summary>
                  <pre className="max-w-sm overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(event.details, null, 2)}</pre>
                </details>}
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>}
      {loading && <p role="status">Loading history…</p>}
      {cursor !== null && <button type="button" disabled={loading} onClick={() => void load(cursor)}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50">Load more</button>}
    </section>
  );
}
