"use client";

import { useEffect, useState, type FormEvent } from "react";
import { adminError, type AccessLevel } from "@/features/dashboard/permissions";

type Role = { id: string; label: string; defaults: Record<string, AccessLevel> };
type Section = { id: string; label: string; levels: AccessLevel[] };
type Account = {
  id: string;
  email: string;
  role: string;
  permissions: Record<string, AccessLevel>;
  enabled: boolean;
  activated_at: string | null;
  expires_at: string | null;
  invitation_expires_at: string | null;
  has_access: boolean;
};
type Directory = { roles: Role[]; sections: Section[]; accounts: Account[] };
const API = "/api/admin/backend/dashboard-admins";
const levelLabels: Record<AccessLevel, string> = { none: "No access", view: "View", manage: "Manage" };
const primary = "rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const secondary = "rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium disabled:opacity-50";

function accountStatus(account: Account) {
  if (!account.enabled) return "Suspended";
  if (account.expires_at && new Date(account.expires_at).getTime() <= Date.now()) return "Access expired";
  if (account.has_access) return "Active";
  if (account.invitation_expires_at && new Date(account.invitation_expires_at).getTime() <= Date.now()) {
    return "Invitation expired";
  }
  return account.activated_at ? "Inactive" : "Invitation pending";
}

async function request<T>(path = "", init?: RequestInit): Promise<T> {
  const response = await fetch(API + path, { cache: "no-store", ...init });
  const body = await response.json();
  if (!response.ok) throw new Error(adminError(body));
  return body as T;
}

export default function DashboardAdminsPage() {
  const [directory, setDirectory] = useState<Directory>();
  const [selected, setSelected] = useState<string | null | undefined>(undefined);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void request<Directory>().then(setDirectory).catch(error => setError(error.message));
  }, []);

  const selectedAccount = directory?.accounts.find(account => account.id === selected);
  function onSaved(account: Account, message: string) {
    setDirectory(current => {
      if (!current) return current;
      const existing = current.accounts.some(row => row.id === account.id);
      const accounts = existing ? current.accounts.map(row => row.id === account.id ? account : row) : [account, ...current.accounts];
      return { ...current, accounts };
    });
    setNotice(message);
    setSelected(account.id);
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 text-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Admin access</h1>
        <button className={primary} disabled={!directory} onClick={() => { setSelected(null); setNotice(""); }}>
          Invite admin
        </button>
      </div>
      {notice && <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-emerald-900">{notice}</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-900">{error}</p>}
      {!directory && !error && <p role="status">Loading admins…</p>}
      {directory && <div className="grid items-start gap-5 lg:grid-cols-[minmax(14rem,22rem)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <h2 className="border-b border-slate-200 px-4 py-3 font-semibold">Dashboard admins</h2>
          {directory.accounts.length === 0 && <p className="p-4 text-sm text-slate-600">No dashboard admins yet.</p>}
          <ul className="divide-y divide-slate-100">
            {directory.accounts.map(account => (
              <li key={account.id}>
                <button type="button" aria-pressed={selected === account.id} onClick={() => { setSelected(account.id); setNotice(""); }}
                  className="w-full space-y-1 px-4 py-3 text-left hover:bg-slate-50 aria-pressed:bg-blue-50">
                  <span className="block break-all text-sm font-medium">{account.email}</span>
                  <span className="block text-xs text-slate-600">
                    {directory.roles.find(role => role.id === account.role)?.label} · {accountStatus(account)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {selected !== undefined && (
          <AccessForm key={selected ?? "invite"} account={selectedAccount} roles={directory.roles}
            sections={directory.sections} onSaved={onSaved} onClose={() => setSelected(undefined)} />
        )}
      </div>}
    </section>
  );
}

function localDateTime(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function AccessForm({ account, roles, sections, onSaved, onClose }: {
  account?: Account;
  roles: Role[];
  sections: Section[];
  onSaved: (account: Account, message: string) => void;
  onClose: () => void;
}) {
  const [role, setRole] = useState(account?.role ?? "custom");
  const [levels, setLevels] = useState(account?.permissions ?? {});
  const [expiry, setExpiry] = useState(localDateTime(account?.expires_at));
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function update(path: string, method: string, data: object, message: string) {
    setBusy(true);
    setError("");
    try {
      const saved = await request<Account>(path, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      onSaved(saved, message);
    } catch (error) {
      setError(error instanceof Error ? error.message : "The change could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const data: Record<string, unknown> = { role, permissions: levels };
    if (!account || expiry !== localDateTime(account.expires_at)) {
      data.expires_at = expiry ? new Date(expiry).toISOString() : null;
    }
    if (account) {
      void update(`/${account.id}`, "PATCH", data, "Admin access updated.");
    } else {
      if (!/^[^@\s]+@zuimi\.com\.ng$/i.test(email.trim())) {
        setError("Use a dedicated @zuimi.com.ng email address.");
        return;
      }
      void update("", "POST", { ...data, email: email.trim() }, "Invitation sent to the admin’s work email.");
    }
  }

  const availableToResend = account && !account.activated_at && account.enabled &&
    (!account.expires_at || new Date(account.expires_at).getTime() > Date.now());

  return (
    <form onSubmit={submit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="break-all text-lg font-semibold">{account?.email ?? "Invite a dashboard admin"}</h2>
          {account && <p className="text-sm text-slate-600">{accountStatus(account)}</p>}
        </div>
        <button type="button" className="text-sm text-slate-600 underline" onClick={onClose}>Close</button>
      </div>
      <fieldset disabled={busy} className="space-y-5">
        {!account && <label className="block text-sm font-medium">
          Work email
          <input className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
            type="email" required placeholder="name@zuimi.com.ng" value={email}
            onChange={event => setEmail(event.target.value)} />
        </label>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Role template
            <select className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
              value={role} onChange={event => {
                const template = roles.find(item => item.id === event.target.value);
                if (template) { setRole(template.id); setLevels(template.defaults); }
              }}>
              {roles.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Access expires <span className="font-normal text-slate-500">(optional)</span>
            <input className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
              type="datetime-local" value={expiry} onChange={event => setExpiry(event.target.value)} />
          </label>
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold">Permissions</h3>
          <p className="text-sm text-slate-600">Set an access level for each section.</p>
          <div className="divide-y divide-slate-100">
            {sections.map(section => (
              <fieldset className="py-2.5" key={section.id}>
                <legend className="pt-2 text-sm font-medium">{section.label}</legend>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {section.levels.map(level => (
                    <label key={level} className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                      <input type="radio" name={section.id} value={level}
                        checked={(levels[section.id] ?? "none") === level}
                        onChange={() => setLevels(current => ({ ...current, [section.id]: level }))} />
                      {levelLabels[level]}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>
        {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button className={primary}>{busy ? "Saving…" : account ? "Save permissions" : "Send invitation"}</button>
          {account && <button type="button" className={secondary}
            onClick={() => void update(`/${account.id}`, "PATCH", { enabled: !account.enabled },
              account.enabled ? "Admin access suspended." : "Admin account restored.")}>
            {account.enabled ? "Suspend access" : "Restore account"}
          </button>}
          {availableToResend && <button type="button" className={secondary}
            onClick={() => void update(`/${account.id}/resend`, "POST", {}, "A new invitation was sent.")}>
            Resend invitation
          </button>}
        </div>
      </fieldset>
    </form>
  );
}
