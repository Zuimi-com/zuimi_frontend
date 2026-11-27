"use client";
import { FormEvent, useState } from "react";
import { Copy, ExternalLink, Plus } from "lucide-react";
import { api, Campaign } from "./data";
import { Panel, Stats } from "./ui";
export default function Campaigns({
  campaigns,
  onRefresh,
  canManage,
}: {
  campaigns: Campaign[];
  onRefresh: () => Promise<void>;
  canManage: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [created, setCreated] = useState("");
  const sum = (
    key: "clicks" | "unique_visitors" | "applications" | "converting_visitors",
  ) => campaigns.reduce((a, c) => a + c[key], 0);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setBusy(true);
    setError("");
    try {
      const c = await api<Campaign>("campaigns/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setCreated(`${window.location.origin}/go/${c.code}/`);
      form.reset();
      await onRefresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function copy(c: Campaign) {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/go/${c.code}/`,
      );
      setMessage(`Copied the ${c.source} link for “${c.name}”.`);
    } catch {
      setMessage("Copy this URL manually from the link below.");
    }
  }
  async function toggle(c: Campaign) {
    setBusy(true);
    setError("");
    try {
      await api(`campaigns/${c.code}/`, {
        method: "PATCH",
        body: JSON.stringify({ active: !c.active }),
      });
      await onRefresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Stats
        values={[
          {
            label: "Tracked clicks",
            value: sum("clicks"),
            note: "Repeat clicks included; known bots excluded",
            color: "#1684ef",
          },
          {
            label: "Visits across sources",
            value: sum("unique_visitors"),
            note: "Distinct visitors per campaign link",
            color: "#f12f7a",
          },
          {
            label: "Applications",
            value: sum("applications"),
            note: "Duplicate email + film submissions removed",
            color: "#f68812",
          },
          {
            label: "Visit conversion",
            value: sum("unique_visitors")
              ? `${((sum("converting_visitors") / sum("unique_visitors")) * 100).toFixed(1)}%`
              : "—",
            note: "Converting visitors ÷ visitors per source",
            color: "#42cba4",
          },
        ]}
      />
      <div className="zb-banner">
        <h2>One link per platform. A measurable invitation.</h2>
        <p>
          Create a separate link for each placement — X bio, X post, Instagram
          bio, WhatsApp group or email outreach. Copy the generated URL and
          share that exact link. Its source is preserved even when an app hides
          the referrer.
        </p>
      </div>
      <Panel title="Create a campaign link">
        {canManage && <form className="zb-panel-body" onSubmit={submit}>
          <div className="zb-fields">
            <label className="zb-field">
              Campaign / placement name
              <input
                required
                name="name"
                maxLength={120}
                placeholder="November creator call · X bio"
              />
            </label>
            <label className="zb-field">
              Platform / source
              <select name="source" defaultValue="x">
                <option value="x">X / Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="email">Email</option>
                <option value="partner">Partner</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="zb-field">
              Channel / medium
              <select name="medium" defaultValue="social">
                <option value="social">Organic social</option>
                <option value="paid-social">Paid social</option>
                <option value="email">Email</option>
                <option value="messaging">Messaging</option>
                <option value="referral">Referral</option>
              </select>
            </label>
            <div className="flex items-end">
              <button disabled={!canManage || busy} className="zb-button zb-gradient">
                <Plus size={14} />
                {busy ? "Saving…" : "Generate explicit link"}
              </button>
            </div>
          </div>
          {created && (
            <div role="status" className="mt-5">
              <p className="zb-success">Link created. Share this exact URL:</p>
              <input
                aria-label="New campaign link"
                className="mt-2"
                value={created}
                readOnly
                onFocus={(e) => e.target.select()}
              />
            </div>
          )}
        </form>}
      </Panel>
      {error && (
        <div role="alert" className="zb-error">
          {error}
        </div>
      )}
      {message && (
        <p role="status" className="zb-notice">
          {message}
        </p>
      )}
      <Panel title="Campaign performance">
        <div className="zb-table-wrap">
          <table className="zb-table">
            <thead>
              <tr>
                <th>Campaign / explicit link</th>
                <th>Source</th>
                <th>Clicks</th>
                <th>Visitors</th>
                <th>Applications</th>
                <th>Conversion</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.code ?? "direct"}>
                  <td>
                    <strong>{c.name}</strong>
                    {c.code && (
                      <>
                        <div className="zb-actions mt-3">
                          <button
                            className="zb-button"
                            disabled={!c.active}
                            onClick={() => void copy(c)}
                          >
                            <Copy size={12} />
                            Copy link
                          </button>
                          <a
                            href={`/go/${c.code}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="zb-link"
                            aria-label={`Open campaign link for ${c.name}`}
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                        <small className="break-all">
                          {typeof window !== "undefined"
                            ? window.location.origin
                            : ""}
                          /go/{c.code}/
                        </small>
                      </>
                    )}
                  </td>
                  <td>
                    {c.source}
                    <small>{c.medium}</small>
                  </td>
                  <td>{c.clicks}</td>
                  <td>{c.unique_visitors}</td>
                  <td>
                    {c.applications}
                    <small>{c.converting_visitors} converting visitors</small>
                  </td>
                  <td>{c.conversion_rate.toFixed(1)}%</td>
                  <td>
                    {c.code ? (
                      <button
                        disabled={!canManage || busy}
                        className="zb-link"
                        onClick={() => void toggle(c)}
                      >
                        {c.active ? "Disable link" : "Reactivate"}
                      </button>
                    ) : (
                      "Public page"
                    )}
                    {c.code && !c.active && (
                      <small>Disabled · old attribution retained</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <p className="zb-notice">
        Conversion rate = unique visitors who submit an application ÷ unique
        visitors to that link. Multiple films from one visitor count once toward
        conversion. Attribution uses the latest tracked source within 30 days;
        the first source is retained on the application. Direct visits do not
        overwrite campaign attribution. Counts are all-time and deduplicated by
        browser identifier per source; devices, cleared cookies, forwarded links
        and unrecognised bots can affect accuracy. Opening your own tracking
        link counts as a visit.
      </p>
    </>
  );
}
