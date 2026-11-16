"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Copy, Plus } from "lucide-react";
import {
  contentTemplates,
  dateLabel,
  Draft,
  emptyItem,
  Item,
  label,
  todayLagos,
  weekOf,
} from "./data";
import { Panel, Pill, Stats } from "./ui";
export default function CEOStudio({
  items,
  onEdit,
  onCreate,
}: {
  items: Item[];
  onEdit: (i: Item) => void;
  onCreate: (i: Draft) => void;
}) {
  const [view, setView] = useState("calendar");
  const [week, setWeek] = useState(weekOf(todayLagos()));
  const [notice, setNotice] = useState("");
  const posts = items.filter((i) => i.kind === "post");
  const templates = items.filter((i) => i.kind === "template");
  const ideas = items.filter((i) => i.kind === "idea");
  const days = Array.from({ length: 7 }, (_, index) => {
    const d = new Date(`${week}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + index);
    return d.toISOString().slice(0, 10);
  });
  const published = posts.filter(
    (p) =>
      p.status === "published" &&
      p.published_at &&
      weekOf(
        new Date(new Date(p.published_at).getTime() + 3600000)
          .toISOString()
          .slice(0, 10),
      ) === week,
  );
  const activeDays = new Set(
    published.map((p) =>
      new Date(new Date(p.published_at!).getTime() + 3600000)
        .toISOString()
        .slice(0, 10),
    ),
  );
  const planned = posts.filter((p) => p.deadline && days.includes(p.deadline));
  const createPost = (title = "", details = "") =>
    onCreate({ ...emptyItem("post", "CEO"), title, details, status: "draft" });
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Copied to clipboard.");
    } catch {
      setNotice("Clipboard is unavailable. Select and copy the text manually.");
    }
  }
  function move(delta: number) {
    const d = new Date(`${week}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + delta);
    setWeek(d.toISOString().slice(0, 10));
  }
  return (
    <>
      <Stats
        values={[
          {
            label: "Published this week",
            value: published.length,
            note: "Verified by recorded URL and time",
            color: "#1684ef",
          },
          {
            label: "Consistency target",
            value: `${Math.min(published.length, 3)} / 3`,
            note: "Operating target: 3 posts per week",
            color: "#f12f7a",
          },
          {
            label: "Active publishing days",
            value: activeDays.size,
            note: "Dates with at least one live post",
            color: "#f68812",
          },
          {
            label: "In the pipeline",
            value: posts.filter((p) => p.status !== "published").length,
            note: "Ideas, drafts and scheduled posts",
            color: "#42cba4",
          },
        ]}
      />
      <div className="zb-banner">
        <h2>Listen. Build. Share what’s real.</h2>
        <p>
          Show the problem Zuimi exists to solve, amplify African storytelling,
          invite filmmakers and share verified progress. Each week, aim for
          three useful posts. Replying and listening matter too.
        </p>
        <div className="zb-progress">
          <span
            style={{ width: `${Math.min((published.length / 3) * 100, 100)}%` }}
          />
        </div>
        <p className="zb-notice">
          This calendar tracks your commitments. It does not publish or schedule
          posts inside X.
        </p>
      </div>
      <div className="zb-tabs">
        {["calendar", "posts", "ideas", "templates"].map((v) => (
          <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>
            {label(v)}
          </button>
        ))}
      </div>
      <div className="zb-week-head">
        <div className="zb-actions">
          <button
            className="zb-button"
            aria-label="Previous week"
            onClick={() => move(-7)}
          >
            <ChevronLeft size={14} />
          </button>
          <strong>Week of {dateLabel(week)}</strong>
          <button
            className="zb-button"
            aria-label="Next week"
            onClick={() => move(7)}
          >
            <ChevronRight size={14} />
          </button>
        </div>
        <label className="zb-field">
          Jump to week
          <input
            type="date"
            value={week}
            onChange={(e) => e.target.value && setWeek(weekOf(e.target.value))}
          />
        </label>
      </div>
      {notice && (
        <p role="status" className="zb-notice">
          {notice}
        </p>
      )}
      {view === "calendar" && (
        <>
          <Panel title="Content calendar · Africa/Lagos">
            <div className="zb-table-wrap">
              <div className="zb-calendar">
                {days.map((day) => (
                  <div className="zb-day" key={day}>
                    <h3>
                      {new Date(`${day}T12:00:00Z`).toLocaleDateString(
                        "en-GB",
                        { weekday: "short", day: "numeric" },
                      )}
                      {activeDays.has(day) ? " · Published" : ""}
                    </h3>
                    {planned
                      .filter((p) => p.deadline === day)
                      .map((p) => (
                        <button key={p.id} onClick={() => onEdit(p)}>
                          {p.title}
                          <br />
                          <Pill status={p.status} />
                        </button>
                      ))}
                    <button
                      aria-label={`Add post for ${day}`}
                      onClick={() =>
                        onCreate({
                          ...emptyItem("post", "CEO"),
                          status: "draft",
                          deadline: day,
                        })
                      }
                    >
                      <Plus size={12} className="inline" /> Plan a post
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
          <Panel title="Unscheduled drafts">
            <Rows
              list={posts.filter(
                (p) => !p.deadline && p.status !== "published",
              )}
            />
          </Panel>
        </>
      )}
      {view === "posts" && (
        <Panel title="Publishing pipeline">
          <Rows list={posts} />
        </Panel>
      )}
      {view === "ideas" && (
        <Panel
          title="Idea bank"
          action={
            <button
              className="zb-button"
              onClick={() => onCreate(emptyItem("idea", "CEO"))}
            >
              <Plus size={13} />
              Add idea
            </button>
          }
        >
          <Rows list={ideas} />
          <div className="zb-panel-body">
            <p className="zb-notice">
              Prompt: What makes distribution difficult for an independent
              African filmmaker? What did your team learn this week? Which film
              deserves a conversation?
            </p>
          </div>
        </Panel>
      )}
      {view === "templates" && (
        <>
          <div className="zb-actions mb-5">
            <button
              className="zb-button"
              onClick={() => onCreate(emptyItem("template", "CEO"))}
            >
              <Plus size={13} />
              Create reusable template
            </button>
          </div>
          <div className="zb-template-grid">
            {[
              ...contentTemplates.map((t) => ({
                ...t,
                id: t.title,
                builtin: true,
              })),
              ...templates.map((t) => ({
                title: t.title,
                text: t.details,
                id: t.id,
                builtin: false,
              })),
            ].map((t) => (
              <article className="zb-template" key={t.id}>
                <p className="zb-eyebrow">
                  {t.builtin ? "Starter template" : "Team template"}
                </p>
                <h3 className="mt-3">{t.title}</h3>
                <pre>{t.text}</pre>
                <div className="zb-actions">
                  <button
                    className="zb-button zb-gradient"
                    onClick={() => createPost(t.title, t.text)}
                  >
                    Use for a post
                  </button>
                  <button
                    className="zb-button"
                    onClick={() => void copy(t.text)}
                    aria-label={`Copy ${t.title}`}
                  >
                    <Copy size={13} />
                  </button>
                  {!t.builtin && (
                    <button
                      className="zb-link"
                      onClick={() =>
                        onEdit(templates.find((i) => i.id === t.id)!)
                      }
                    >
                      Edit
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
  function Rows({ list }: { list: Item[] }) {
    return list.length ? (
      <>
        {list.map((i) => (
          <div className="zb-row" key={i.id}>
            <div>
              <button onClick={() => onEdit(i)}>
                <h3>{i.title}</h3>
              </button>
              <p>
                {i.owner_name || i.owner} · {dateLabel(i.deadline)}
              </p>
              {i.details && <p className="line-clamp-2">{i.details}</p>}
            </div>
            <div className="zb-actions">
              <Pill status={i.status} />
              {i.kind === "idea" && (
                <button
                  className="zb-link"
                  onClick={() => createPost(i.title, i.details)}
                >
                  Draft post
                </button>
              )}
              {i.post_url && (
                <a
                  href={i.post_url}
                  target="_blank"
                  rel="noreferrer"
                  className="zb-link"
                >
                  View on X
                </a>
              )}
              <button
                aria-label={`Copy ${i.title}`}
                onClick={() => void copy(i.details)}
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        ))}
      </>
    ) : (
      <div className="zb-empty">
        Nothing here yet. Capture an idea or plan your next post.
      </div>
    );
  }
}
