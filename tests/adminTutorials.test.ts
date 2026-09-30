import test from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_TUTORIALS,
  adminTutorialProgressKey,
  normalizeAdminTutorialProgress,
  visibleAdminTutorials,
} from "../lib/tutorials/adminTutorials";
import { tutorialAllowsRequest } from "../lib/tutorials/adminTutorialGuards";

test("catalogue has 16 unique, versioned tutorials on supported admin routes", () => {
  assert.equal(ADMIN_TUTORIALS.length, 16);
  assert.equal(new Set(ADMIN_TUTORIALS.map(({ id }) => id)).size, 16);
  for (const tutorial of ADMIN_TUTORIALS) {
    assert.match(tutorial.route, /^\/admin(?:\/[-a-z]+)?$/);
    assert.ok(tutorial.version > 0);
    assert.ok(tutorial.steps.length > 0);
  }
});

test("every step uses a valid stable data-tutorial selector", () => {
  for (const tutorial of ADMIN_TUTORIALS) {
    for (const tutorialStep of tutorial.steps) {
      const targets = tutorialStep.targets || (tutorialStep.target ? [tutorialStep.target] : []);
      assert.ok(targets.length > 0, `${tutorial.id}: ${tutorialStep.title}`);
      for (const target of targets) {
        assert.match(target, /^\[data-tutorial="[a-z0-9-]+"\]$/);
      }
    }
  }
});

test("progress is clamped and storage is namespaced by admin and version", () => {
  const tutorial = ADMIN_TUTORIALS[0];
  assert.deepEqual(normalizeAdminTutorialProgress(null, 3), { status: "not_started", step: 0 });
  assert.deepEqual(normalizeAdminTutorialProgress({ status: "in_progress", step: 99 }, 3), { status: "in_progress", step: 2, updatedAt: undefined });
  assert.equal(adminTutorialProgressKey("admin-7", tutorial), `zuimi:admin-tutorial:admin-7:${tutorial.id}:v${tutorial.version}`);
});

test("operator tutorials require the capability", () => {
  assert.equal(visibleAdminTutorials({}).length, 14);
  assert.equal(visibleAdminTutorials({ manage_operators: true }).length, 16);
});

test("stateful tutorials declare the fixture states their targets need", () => {
  const required = new Map([
    ["admin-upload-movie-video", ["video", "video-replace", "video-uploading"]],
    ["admin-prepare-publish-movie", ["asset-uploaded", "asset-ready"]],
    ["admin-troubleshoot-movie", ["asset-failed", "asset-failed-open", "asset-published"]],
    ["admin-newsletter-images", ["images-selected", "images-gallery"]],
    ["admin-review-subscribers", ["subscriber-loading", "subscriber-empty", "subscriber-error"]],
    ["admin-manage-operator-access", ["operator-active", "operator-disable", "operator-disabled"]],
  ]);
  for (const [id, states] of required) {
    const tutorial = ADMIN_TUTORIALS.find((item) => item.id === id);
    assert.ok(tutorial);
    const actual = new Set(tutorial.steps.map((item) => item.demoState).filter(Boolean));
    for (const state of states) assert.ok(actual.has(state), `${id} is missing ${state}`);
  }
});

test("tutorial playback blocks every mutation method", () => {
  for (const method of ["POST", "patch", "Put", "DELETE"]) {
    assert.equal(tutorialAllowsRequest(true, method), false);
  }
  assert.equal(tutorialAllowsRequest(true, "GET"), true);
  assert.equal(tutorialAllowsRequest(false, "POST"), true);
});
