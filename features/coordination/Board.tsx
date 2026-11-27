"use client";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCheck,
  CircleDot,
  Clapperboard,
  Flag,
  LayoutDashboard,
  Link2,
  ListChecks,
  MessageSquareText,
  Plus,
  RefreshCw,
  Users,
  X as XIcon,
} from "lucide-react";
import Image from "next/image";
import {
  api,
  Application,
  blockedBy,
  Campaign,
  closed,
  dateLabel,
  Draft,
  emptyItem,
  Item,
  Kind,
  label,
  overdue,
  Role,
  roles,
  scopeSuggestions,
  todayLagos,
  weekOf,
} from "./data";
import ItemEditor from "./ItemEditor";
import CEOStudio from "./CEOStudio";
import Campaigns from "./Campaigns";
import CreatorPipeline from "./CreatorPipeline";
import "./workspace.css";
import { Panel, Pill, Stats } from "./ui";
const sections = [
  { id: "overview", label: "Accountability", icon: LayoutDashboard },
  { id: "work", label: "Team workstreams", icon: Users },
  { id: "scope", label: "MVP scope", icon: ListChecks },
  { id: "ceo", label: "CEO · X studio", icon: XIcon },
  { id: "creators", label: "Creator pipeline", icon: Clapperboard },
  { id: "campaigns", label: "Campaign links", icon: Link2 },
  { id: "logs", label: "Decisions & notes", icon: MessageSquareText },
  { id: "weekly", label: "Weekly goals", icon: Flag },
];
export default function Board({ canManage, canViewCreators, canManageCreators, canViewAudit }: {
  canManage: boolean; canViewCreators: boolean; canManageCreators: boolean; canViewAudit: boolean;
}) {
  const [section, setSection] = useState("overview");
  const [items, setItems] = useState<Item[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [editor, setEditor] = useState<Item | Draft | null>(null);
  const [owner, setOwner] = useState<Role | "All">("All");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [logKind, setLogKind] = useState<Kind>("decision");
  const [week, setWeek] = useState(weekOf(todayLagos()));
  const [seeding, setSeeding] = useState(false);
  const [savingScope, setSavingScope] = useState(false);
  const load = useCallback(async () => {
    setSyncing(true);
    try {
      const [work, applications, analytics] = await Promise.all([
        api<Item[]>("work/"),
        canViewCreators ? api<Application[]>("applications/") : Promise.resolve([]),
        api<{ rows: Campaign[] }>("campaigns/analytics/"),
      ]);
      setItems(work);
      setApps(applications);
      setCampaigns(analytics.rows);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [canViewCreators]);
  useEffect(() => {
    void load();
  }, [load]);
  const save = async (value: Draft | Item) => {
    if (!canManage) return;
    await api("id" in value ? `work/${value.id}/` : "work/", {
      method: "id" in value ? "PATCH" : "POST",
      body: JSON.stringify(value),
    });
    await load();
  };
  const add = (
    kind: Kind = "task",
    role: Role = owner === "All" ? "CEO" : owner,
  ) =>
    canManage && setEditor({
      ...emptyItem(kind, role),
      week_start: ["goal", "commitment"].includes(kind) ? week : null,
    });
  const today = todayLagos();
  const open = items.filter((i) => !closed(i));
  const late = open.filter((i) => overdue(i, today));
  const blocked = open.filter(
    (i) =>
      i.status === "blocked" ||
      i.kind === "blocker" ||
      blockedBy(i, items).length,
  );
  const scope = items.filter((i) => i.kind === "scope");
  const done = scope.filter(closed).length;
  const commitments = open.filter((i) => i.kind === "commitment");
  const filtered = (list: Item[]) =>
    list.filter(
      (i) =>
        (owner === "All" || i.owner === owner) &&
        (status === "All" || i.status === status) &&
        `${i.title} ${i.details} ${i.owner_name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    );
  async function seed() {
    if (!canManage) return;
    setSeeding(true);
    setError("");
    try {
      for (const [title, role, details] of scopeSuggestions) {
        if (!items.some((i) => i.kind === "scope" && i.title === title))
          await api("work/", {
            method: "POST",
            body: JSON.stringify({
              ...emptyItem("scope", role),
              title,
              details,
            }),
          });
      }
      await load();
    } catch (e) {
      setError((e as Error).message);
      await load();
    } finally {
      setSeeding(false);
    }
  }
  function ItemRows({ list, empty }: { list: Item[]; empty: string }) {
    return list.length ? (
      <>
        {list.map((i) => (
          <div className="zb-row" key={i.id}>
            <div>
              <button onClick={() => setEditor(i)}>
                <h3>{i.title}</h3>
              </button>
              <p>
                {i.owner}
                {i.owner_name ? ` / ${i.owner_name}` : ""} ·{" "}
                {dateLabel(i.deadline)}
                {overdue(i, today) ? " · Overdue" : ""}
              </p>
              {i.next_action && <p>Next → {i.next_action}</p>}
              {blockedBy(i, items).length > 0 && (
                <p>
                  Waiting on:{" "}
                  {blockedBy(i, items)
                    .map((d) => d.title)
                    .join(", ")}
                </p>
              )}
            </div>
            <Pill status={i.status} />
          </div>
        ))}
      </>
    ) : (
      <div className="zb-empty">{empty}</div>
    );
  }
  function Table({ list }: { list: Item[] }) {
    return (
      <Panel title={`${list.length} work items`}>
        <div className="zb-table-wrap">
          <table className="zb-table">
            <thead>
              <tr>
                <th>Work / next action</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Dependencies</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {i.kind === "scope" && (
                        <input
                          type="checkbox"
                          aria-label={`Accept scope: ${i.title}`}
                          checked={closed(i)}
                          disabled={!canManage || savingScope}
                          style={{ width: 16, height: 16, flexShrink: 0 }}
                          onChange={async (e) => {
                            const accepted = e.target.checked;
                            setSavingScope(true);
                            try {
                              await save({
                                ...i,
                                status: accepted ? "done" : "planned",
                              });
                            } catch (error) {
                              setError((error as Error).message);
                            } finally {
                              setSavingScope(false);
                            }
                          }}
                        />
                      )}
                      <button onClick={() => setEditor(i)}>{i.title}</button>
                    </div>
                    <small>{i.next_action || label(i.kind)}</small>
                  </td>
                  <td>
                    {i.owner}
                    <small>{i.owner_name || "Assign a person"}</small>
                  </td>
                  <td>
                    <Pill status={i.status} />
                  </td>
                  <td>
                    <span
                      style={{
                        color: overdue(i, today) ? "#fda4af" : undefined,
                      }}
                    >
                      {dateLabel(i.deadline)}
                    </span>
                  </td>
                  <td>
                    {i.dependencies.length
                      ? `${blockedBy(i, items).length} open / ${i.dependencies.length}`
                      : "—"}
                  </td>
                  <td>
                    <button className="zb-link" onClick={() => setEditor(i)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!list.length && (
          <div className="zb-empty">
            No items match this view. Create an item or adjust the filters.
          </div>
        )}
      </Panel>
    );
  }
  const toolbar = (
    <div className="zb-toolbar">
      <input
        aria-label="Search work"
        placeholder="Search work, owners, next steps…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        aria-label="Filter workstream"
        value={owner}
        onChange={(e) => setOwner(e.target.value as Role | "All")}
      >
        <option>All</option>
        {roles.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <select
        aria-label="Filter status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option>All</option>
        {Array.from(new Set(items.map((i) => i.status))).map((s) => (
          <option key={s} value={s}>
            {label(s)}
          </option>
        ))}
      </select>
    </div>
  );
  if (loading)
    return (
      <div className="zb-loading">
        <p>Opening Zuimi’s shared workspace…</p>
      </div>
    );
  return (
    <div className="zuimi-board">
      <div className="zb-shell">
        <aside className="zb-sidebar">
          <a href="/" aria-label="Zuimi home">
            <Image src="/zuimi-logo.svg" width={119} height={34} alt="Zuimi" />
          </a>
          <p className="zb-brand-label">Delivery & Growth</p>
          <nav aria-label="Workspace navigation">
            {sections.filter(s => s.id !== "creators" || canViewCreators).map((s) => (
              <button
                key={s.id}
                aria-current={section === s.id ? "page" : undefined}
                onClick={() => {
                  setSection(s.id);
                  setSearch("");
                  setStatus("All");
                  setOwner("All");
                }}
              >
                <s.icon size={16} />
                {s.label}
              </button>
            ))}
          </nav>
          <div className="zb-side-foot">
            <span className="zb-pill" data-tone="green">
              <CircleDot size={9} /> Admin workspace
            </span>
            <p className="mt-4">
              African stories.
              <br />
              Built with intention.
            </p>
            <a href="/admin">Return to admin ↗</a>
            <a href="/creators/apply/" target="_blank" rel="noreferrer">
              Creator application ↗
            </a>
          </div>
        </aside>
        <main className="zb-main">
          <div className="zb-topbar">
            <span>
              ZUIMI /{" "}
              {sections.find((s) => s.id === section)?.label.toUpperCase()}
            </span>
            <div className="zb-actions">
              <span>
                <CalendarDays size={12} className="inline mr-2" />
                {dateLabel(today)} · Lagos
              </span>
              <button
                aria-label="Refresh workspace"
                disabled={syncing}
                onClick={() => void load()}
              >
                <RefreshCw
                  size={14}
                  className={syncing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
          <header className="zb-hero">
            <div>
              <p className="zb-eyebrow">From ambition to a functioning MVP</p>
              <h1>
                {
                  (
                    {
                      overview: "Make progress visible.",
                      work: "One team. Clear ownership.",
                      scope: "Build what matters first.",
                      ceo: "Give Zuimi a public voice.",
                      creators: "The next wave of storytellers.",
                      campaigns: "Know where creators find us.",
                      logs: "Keep the context. Move forward.",
                      weekly: "Commit to the next step.",
                    } as Record<string, string>
                  )[section]
                }
              </h1>
              <p>
                {section === "ceo"
                  ? "Plan, write and track your X presence. Consistency is a commitment you can see."
                  : section === "creators"
                    ? "Review creator applications, follow up with intention and preserve the source of every introduction."
                    : "MVP delivery and public brand-building, together. Africa-first film distribution. Pay for the films you choose."}
              </p>
            </div>
            {canManage && <button
              className="zb-button zb-gradient"
              onClick={() =>
                add(
                  section === "scope"
                    ? "scope"
                    : section === "weekly"
                      ? "goal"
                      : section === "logs"
                        ? logKind
                        : section === "ceo"
                          ? "post"
                          : "task",
                  section === "ceo" ? "CEO" : owner === "All" ? "CEO" : owner,
                )
              }
            >
              <Plus size={15} />
              Add{" "}
              {section === "scope"
                ? "scope item"
                : section === "weekly"
                  ? "weekly goal"
                  : section === "logs"
                    ? logKind
                    : section === "ceo"
                      ? "post"
                      : "work item"}
            </button>}
          </header>
          {error && (
            <div role="alert" className="zb-error">
              {error}{" "}
              <button className="zb-link" onClick={() => void load()}>
                Retry
              </button>{" "}
              ·{" "}
              <a className="zb-link" href="/admin-login">
                Sign in
              </a>
            </div>
          )}
          {section === "overview" && (
            <>
              <Stats
                values={[
                  {
                    label: "MVP scope complete",
                    value: scope.length
                      ? `${Math.round((done / scope.length) * 100)}%`
                      : "—",
                    note: `${done} of ${scope.length} acceptance checks`,
                    color: "#1684ef",
                  },
                  {
                    label: "Overdue work",
                    value: late.length,
                    note: "Needs a new commitment",
                    color: "#f12f7a",
                  },
                  {
                    label: "Blocked / waiting",
                    value: blocked.length,
                    note: "Resolve the dependency",
                    color: "#f68812",
                  },
                  {
                    label: "Open commitments",
                    value: commitments.length,
                    note: "Make the next action concrete",
                    color: "#42cba4",
                  },
                ]}
              />
              <div className="zb-grid">
                <div>
                  <Panel
                    title="Needs attention now"
                    action={
                      <span className="zb-pill" data-tone="red">
                        {late.length} overdue
                      </span>
                    }
                  >
                    <ItemRows
                      list={late}
                      empty="No overdue work. Keep deadlines current so this stays useful."
                    />
                  </Panel>
                  <Panel title="Dependencies & blockers">
                    <ItemRows
                      list={blocked}
                      empty="No blockers recorded. Log obstacles early, with an owner and next action."
                    />
                  </Panel>
                  <Panel title="Next actions">
                    <ItemRows
                      list={open.filter((i) => i.next_action)}
                      empty="Add a concrete next action to your work items."
                    />
                  </Panel>
                </div>
                <div>
                  <Panel
                    title="MVP readiness"
                    action={<CheckCheck size={17} />}
                  >
                    <div className="zb-panel-body">
                      <div className="flex justify-between">
                        <span className="zb-muted">Accepted scope</span>
                        <strong>
                          {done}/{scope.length}
                        </strong>
                      </div>
                      <div className="zb-progress">
                        <span
                          style={{
                            width: `${scope.length ? (done / scope.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <p className="zb-notice">
                        Completion reflects your team’s acceptance, not an
                        automated repository audit.
                      </p>
                      <button
                        className="zb-button"
                        onClick={() => setSection("scope")}
                      >
                        Review scope <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </Panel>
                  <Panel title="This week’s commitments">
                    <ItemRows
                      list={commitments.filter(
                        (i) => i.week_start === weekOf(today),
                      )}
                      empty="No commitments recorded for this week. Turn intentions into owned, dated actions."
                    />
                  </Panel>
                  {canViewCreators && <Panel title="Creator momentum">
                    <div className="zb-panel-body">
                      <strong className="text-3xl">{apps.length}</strong>
                      <p className="zb-notice">
                        Applications received ·{" "}
                        {apps.filter((a) => a.status === "new").length} awaiting
                        first review
                      </p>
                      <button
                        className="zb-button"
                        onClick={() => setSection("creators")}
                      >
                        Open pipeline <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </Panel>}
                </div>
              </div>
            </>
          )}
          {section === "work" && (
            <>
              <div className="zb-role-grid">
                {roles.map((r, index) => {
                  const work = items.filter((i) => i.owner === r && !closed(i));
                  return (
                    <button
                      className="zb-role-card"
                      key={r}
                      aria-pressed={owner === r}
                      onClick={() => setOwner(owner === r ? "All" : r)}
                    >
                      <span className="zb-avatar">
                        {["CE", "DE", "CT", "PM"][index]}
                      </span>
                      <h2>{r}</h2>
                      <p className="zb-muted">
                        {work.length} open ·{" "}
                        {work.filter((i) => overdue(i, today)).length} overdue
                      </p>
                    </button>
                  );
                })}
              </div>
              {toolbar}
              <Table
                list={filtered(
                  items.filter((i) => ["task", "commitment"].includes(i.kind)),
                )}
              />
            </>
          )}
          {section === "scope" && (
            <>
              <div className="zb-banner">
                <h2>A smaller scope. A real product.</h2>
                <p>
                  Keep acceptance criteria explicit: viewer access,
                  transactional purchases, playback, creator rights, revenue
                  visibility and moderation. Imported suggestions start as
                  planned; review them with the team.
                </p>
                <button
                  disabled={!canManage || seeding}
                  onClick={() => void seed()}
                  className="zb-button mt-4"
                >
                  {seeding
                    ? "Adding suggestions…"
                    : "Add suggested MVP checklist"}
                </button>
              </div>
              {toolbar}
              <Table list={filtered(scope)} />
            </>
          )}
          {section === "ceo" && (
            <CEOStudio items={items} onEdit={setEditor} onCreate={setEditor} canManage={canManage} />
          )}
          {section === "campaigns" && (
            <Campaigns campaigns={campaigns} onRefresh={load} canManage={canManage} />
          )}
          {section === "creators" && canViewCreators && (
            <CreatorPipeline applications={apps} onRefresh={load} canManage={canManageCreators} />
          )}
          {section === "logs" && (
            <>
              <div className="zb-tabs">
                {(["decision", "blocker", "meeting"] as Kind[]).map((k) => (
                  <button
                    key={k}
                    aria-pressed={logKind === k}
                    onClick={() => setLogKind(k)}
                  >
                    {label(k)}s
                  </button>
                ))}
              </div>
              {toolbar}
              <Table list={filtered(items.filter((i) => i.kind === logKind))} />
            </>
          )}
          {section === "weekly" && (
            <>
              <div className="zb-week-head">
                <p className="zb-muted">
                  Week beginning {dateLabel(week)} · Goals and commitments stay
                  connected to their owners.
                </p>
                <label className="zb-field">
                  Week of
                  <input
                    type="date"
                    value={week}
                    onChange={(e) =>
                      e.target.value && setWeek(weekOf(e.target.value))
                    }
                  />
                </label>
              </div>
              <div className="zb-actions mb-5">
                <button className="zb-button" disabled={!canManage} onClick={() => add("commitment")}>
                  Add commitment
                </button>
              </div>
              {toolbar}
              <Table
                list={filtered(
                  items.filter(
                    (i) =>
                      ["goal", "commitment"].includes(i.kind) &&
                      i.week_start === week,
                  ),
                )}
              />
            </>
          )}
        </main>
      </div>
      {editor && (
        <ItemEditor
          initial={editor}
          items={items}
          onClose={() => setEditor(null)}
          onSave={save}
          canManage={canManage}
          canViewAudit={canViewAudit}
        />
      )}
    </div>
  );
}
