import { isSameOriginRequest, publicRequestOrigin } from "../lib/server/request-origin";
import test from "node:test";
import assert from "node:assert/strict";
import {
  api,
  blockedBy,
  closed,
  emptyItem,
  Item,
  overdue,
  weekOf,
} from "../features/coordination/data";
const item = (id: string, changes: Partial<Item> = {}): Item => ({
  ...emptyItem(),
  id,
  revision: 1,
  updated_at: "2026-11-16T00:00:00Z",
  ...changes,
});
test("a deadline becomes overdue after its Lagos calendar date, not on the day itself", () => {
  const task = item("one", { deadline: "2026-11-16" });
  assert.equal(overdue(task, "2026-11-16"), false);
  assert.equal(overdue(task, "2026-11-17"), true);
  assert.equal(overdue({ ...task, status: "done" }, "2026-11-17"), false);
  assert.equal(overdue(item("two"), "2026-11-17"), false);
});
test("weeks start on Monday through Sunday and across year boundaries", () => {
  assert.equal(weekOf("2026-11-16"), "2026-11-16");
  assert.equal(weekOf("2026-11-22"), "2026-11-16");
  assert.equal(weekOf("2027-01-01"), "2026-12-28");
});
test("resolved decisions and published posts satisfy dependencies while planned work blocks", () => {
  const dependencies = [
    item("task"),
    item("decision", { kind: "decision", status: "resolved" }),
    item("post", { kind: "post", status: "published" }),
  ];
  assert.deepEqual(
    blockedBy(
      item("dependent", { dependencies: dependencies.map((i) => i.id) }),
      dependencies,
    ).map((i) => i.id),
    ["task"],
  );
  assert.equal(closed(dependencies[1]), true);
  assert.equal(closed(dependencies[2]), true);
});


test("creating work uses the coordination proxy and sends the complete draft", async () => {
  const original = globalThis.fetch;
  const draft = { ...emptyItem("task", "CTO"), title: "Shared accountability" };
  globalThis.fetch = async (path, options) => {
    assert.equal(path, "/api/admin/backend/coordination/work/");
    assert.equal(options?.method, "POST");
    assert.deepEqual(JSON.parse(String(options?.body)), draft);
    return Response.json({ ...draft, id: "created", revision: 1 }, { status: 201 });
  };
  try {
    const created = await api<Item>("work/", { method: "POST", body: JSON.stringify(draft) });
    assert.equal(created.id, "created");
  } finally { globalThis.fetch = original; }
});

test("missing coordination deployment reports the actual API problem instead of a generic save error", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response("<html>Not Found</html>", { status: 404 });
  try { await assert.rejects(api("work/", {method: "POST"}), /backend is unavailable.*migration/); }
  finally { globalThis.fetch = original; }
});

test("validation and origin errors remain visible and server failures are sanitized", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({dependencies: ["Complete prerequisites first."]}, {status: 400});
    await assert.rejects(api("work/"), /Dependencies: Complete prerequisites first/);
    globalThis.fetch = async () => Response.json({detail: "Invalid request origin."}, {status: 403});
    await assert.rejects(api("work/"), /Invalid request origin/);
    globalThis.fetch = async () => Response.json({detail: "Traceback: private database details"}, {status: 500});
    await assert.rejects(api("work/"), /temporarily unavailable/);
  } finally { globalThis.fetch = original; }
});


test("same-host mutations work on a loopback alias and behind a forwarded public host", () => {
  assert.equal(isSameOriginRequest(new Headers({origin: "http://127.0.0.1:3302", host: "127.0.0.1:3302"})), true);
  assert.equal(isSameOriginRequest(new Headers({origin: "https://board.devtunnels.ms", host: "localhost:3000", "x-forwarded-host": "board.devtunnels.ms"})), true);
});

test("origin checks reject foreign origins, lookalikes and malformed input", () => {
  for (const origin of ["https://evil.example", "https://board.example.evil.test", "null", "not a URL", "https://user@board.example", "https://board.example/path"]) {
    assert.equal(isSameOriginRequest(new Headers({origin, host: "board.example"})), false);
  }
  assert.equal(isSameOriginRequest(new Headers({origin: "https://board.example", host: "evil.example"})), false);
  assert.equal(isSameOriginRequest(new Headers({host: "board.example"})), false);
  assert.equal(isSameOriginRequest(new Headers({host: "board.example"}), true), true);
});


test("campaign and session redirects use the public host and HTTPS, not Next's internal URL", () => {
  assert.equal(publicRequestOrigin({url: "http://localhost:3000/go/example", headers: new Headers({host: "localhost:3000", "x-forwarded-host": "board.devtunnels.ms", "x-forwarded-proto": "https"})}), "https://board.devtunnels.ms");
  assert.equal(publicRequestOrigin({url: "http://localhost:3302/", headers: new Headers({host: "127.0.0.1:3302"})}), "http://127.0.0.1:3302");
});
