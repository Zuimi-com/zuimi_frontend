"use client";
import { useCallback, useEffect, useState } from "react";
import { api, Application } from "@/features/coordination/data";
import { useAdminAuth } from "@/features/dashboard/context/admin-auth-context";
import { hasAdminPermission } from "@/features/dashboard/permissions";
import CreatorPipeline from "@/features/coordination/CreatorPipeline";
import "@/features/coordination/workspace.css";
export default function CreatorApplications() {
  const { admin } = useAdminAuth();
  const [items, setItems] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      setItems(await api<Application[]>("applications/"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <div className="zuimi-board rounded-xl p-6">
      <header className="zb-hero">
        <div>
          <p className="zb-eyebrow">Creator relationships</p>
          <h1>Creator applications</h1>
          <p>
            Review filmmakers, track follow-ups and see which campaign
            introduced them.
          </p>
        </div>
        <button className="zb-button" onClick={() => void load()}>
          Refresh
        </button>
      </header>
      {error && (
        <p role="alert" className="zb-error">
          {error}
        </p>
      )}
      {loading ? (
        <p className="zb-empty">Loading applications…</p>
      ) : (
        <CreatorPipeline applications={items} onRefresh={load} canManage={hasAdminPermission(admin, "creators", "manage")} />
      )}
    </div>
  );
}
