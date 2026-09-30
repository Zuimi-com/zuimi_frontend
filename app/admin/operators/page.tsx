"use client";

import { useAdminAuth } from "@/features/dashboard/context/admin-auth-context";
import { useAdminTutorial } from "@/components/admin/tutorials/AdminTutorialProvider";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Operator = {
  id: string;
  email: string;
  role: "moderator" | "cto";
  enabled: boolean;
  active: boolean;
};

const fixtures: Operator[] = [
  {
    id: "demo-active",
    email: "moderator@zuimi.example",
    role: "moderator",
    enabled: true,
    active: true,
  },
  {
    id: "demo-pending",
    email: "forensics@zuimi.example",
    role: "cto",
    enabled: true,
    active: false,
  },
  {
    id: "demo-disabled",
    email: "former-operator@zuimi.example",
    role: "moderator",
    enabled: false,
    active: false,
  },
];

export default function OperatorsPage() {
  const { admin } = useAdminAuth();
  const { isPlayback, demoState } = useAdminTutorial();
  const canManage = admin?.capabilities.manage_operators === true;
  const [accounts, setAccounts] = useState<Operator[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Operator["role"]>("moderator");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmAccount, setConfirmAccount] = useState<Operator | null>(null);

  const displayedAccounts = useMemo(() => {
    if (!isPlayback) return accounts;
    if (demoState === "operator-pending") return [fixtures[1]];
    if (demoState === "operator-disabled") return [fixtures[2]];
    return fixtures;
  }, [accounts, demoState, isPlayback]);

  async function load() {
    if (!canManage || isPlayback) return;
    const response = await fetch("/api/admin/backend/operators", { cache: "no-store" });
    if (!response.ok) {
      setMessage("Operator accounts could not be loaded.");
      return;
    }
    setAccounts(await response.json());
  }

  useEffect(() => {
    void load();
  }, [canManage, isPlayback]);

  async function invite(event: FormEvent) {
    event.preventDefault();
    if (isPlayback) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/backend/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.email?.[0] || data.detail || "The invitation could not be sent.");
        return;
      }
      setMessage(`Invitation emailed to ${data.email}. The link expires in 24 hours.`);
      setEmail("");
      await load();
    } catch {
      setMessage("The invitation could not be sent. Check the connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmStateChange() {
    if (!confirmAccount || isPlayback) return;
    setBusy(true);
    const response = await fetch(
      `/api/admin/backend/operators/${confirmAccount.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !confirmAccount.enabled }),
      },
    );
    if (!response.ok) {
      setMessage("This operator account could not be updated.");
    } else {
      setMessage(
        confirmAccount.enabled
          ? `${confirmAccount.email} has been disabled.`
          : `${confirmAccount.email} has been enabled.`,
      );
      await load();
    }
    setConfirmAccount(null);
    setBusy(false);
  }

  if (!canManage) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        Operator management requires the operator-management permission.
      </div>
    );
  }

  const demoConfirm =
    isPlayback && demoState === "operator-disable" ? fixtures[0] : null;
  const visibleConfirm = confirmAccount || demoConfirm;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div data-tutorial="operator-invite-overview">
        <h1 className="text-2xl font-semibold">Operator accounts</h1>
        <p className="mt-1 text-sm text-slate-600">
          Invite report moderators or CTO operators. Each person sets a password through a single-use email link.
        </p>
      </div>

      {message ? (
        <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          {message}
        </p>
      ) : null}

      <form onSubmit={invite} className="space-y-4 rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Invite an operator</h2>
        <label data-tutorial="operator-email" className="block">
          Email
          <input
            className="mt-1 w-full rounded border p-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPlayback}
            required
          />
        </label>
        <label data-tutorial="operator-role" className="block">
          Role
          <select
            className="mt-1 w-full rounded border p-2"
            value={role}
            onChange={(event) => setRole(event.target.value as Operator["role"])}
            disabled={isPlayback}
          >
            <option value="moderator">Report moderator</option>
            <option value="cto">CTO — forensics</option>
          </select>
        </label>
        <button
          data-tutorial="operator-invite-submit"
          disabled={busy || isPlayback}
          className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send invitation"}
        </button>
      </form>

      <section data-tutorial="operator-accounts" className="space-y-4 rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Accounts</h2>
        {displayedAccounts.length === 0 ? <p>No operators invited yet.</p> : null}
        {displayedAccounts.map((account, index) => (
          <div
            key={account.id}
            data-tutorial={
              index === 0 && !account.active ? "operator-pending" : undefined
            }
            className="flex flex-wrap items-center justify-between gap-3 border-b pb-3"
          >
            <div>
              <strong>{account.email}</strong>
              <p data-tutorial={index === 0 ? "operator-state" : undefined} className="text-sm">
                {account.role} · {account.enabled ? (account.active ? "Active" : "Invitation pending") : "Disabled"}
              </p>
            </div>
            <button
              type="button"
              data-tutorial={index === 0 ? "operator-toggle" : undefined}
              className="rounded border px-3 py-2"
              disabled={busy || isPlayback}
              onClick={() => setConfirmAccount(account)}
            >
              {account.enabled ? "Disable" : "Enable"}
            </button>
          </div>
        ))}
      </section>

      {visibleConfirm ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <section
            data-tutorial="operator-confirm"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="text-lg font-semibold">
              {visibleConfirm.enabled ? "Disable operator access?" : "Enable operator access?"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {visibleConfirm.enabled
                ? `${visibleConfirm.email} will no longer be able to use operator credentials.`
                : `${visibleConfirm.email} will regain access after this change.`}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => !isPlayback && setConfirmAccount(null)} className="rounded-lg border px-4 py-2 text-sm">
                Cancel
              </button>
              <button type="button" onClick={confirmStateChange} disabled={busy || isPlayback} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                Confirm
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

