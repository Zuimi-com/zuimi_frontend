const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

export function tutorialAllowsRequest(
  isPlayback: boolean,
  method: string | undefined,
) {
  if (!isPlayback) return true;
  return !MUTATING_METHODS.has((method || "get").toLowerCase());
}
