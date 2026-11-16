import test from "node:test";
import assert from "node:assert/strict";
import {
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
