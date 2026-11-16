export const roles = [
  "CEO",
  "Designer",
  "CTO",
  "Product / Project Manager",
] as const;
export type Role = (typeof roles)[number];
export const kinds = [
  "task",
  "scope",
  "goal",
  "commitment",
  "post",
  "idea",
  "template",
  "decision",
  "blocker",
  "meeting",
] as const;
export type Kind = (typeof kinds)[number];
export type Item = {
  id: string;
  kind: Kind;
  title: string;
  owner: Role;
  owner_name: string;
  status: string;
  deadline: string | null;
  week_start: string | null;
  details: string;
  next_action: string;
  dependencies: string[];
  published_at: string | null;
  post_url: string;
  revision: number;
  updated_at: string;
};
export const statuses = (kind: Kind) =>
  ({
    post: ["idea", "draft", "ready", "scheduled", "published"],
    idea: ["idea", "draft", "done"],
    template: ["draft", "ready"],
    decision: ["open", "resolved"],
    blocker: ["open", "resolved"],
    meeting: ["planned", "done"],
  })[kind as string] ?? ["planned", "in_progress", "blocked", "done"];
export const closed = (item: Item) =>
  ["done", "resolved", "published"].includes(item.status);
export const todayLagos = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function weekOf(day: string) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}
export const dateLabel = (day: string | null) =>
  day
    ? new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : "No deadline";
export const blockedBy = (item: Item, items: Item[]) =>
  item.dependencies
    .map((id) => items.find((i) => i.id === id))
    .filter((i): i is Item => !!i && !closed(i));
export const overdue = (item: Item, today: string) =>
  !!item.deadline && item.deadline < today && !closed(item);
export const label = (value: string) =>
  value.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
export type Campaign = {
  code: string | null;
  name: string;
  source: string;
  medium: string;
  active: boolean;
  clicks: number;
  unique_visitors: number;
  applications: number;
  converting_visitors: number;
  conversion_rate: number;
};
export type Application = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  role: string;
  film_title: string;
  film_stage: string;
  genre: string;
  synopsis: string;
  portfolio_url: string;
  rights_confirmed: boolean;
  consent: boolean;
  status: string;
  review_notes: string;
  created_at: string;
  updated_at: string;
  first_source: { source: string; name: string; referrer: string };
  latest_source: { source: string; name: string; referrer: string };
};
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/admin/backend/coordination/${path}`, {
    ...options,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 || response.status === 403)
      throw new Error(
        "Your admin session is unavailable. Sign in again, then reload.",
      );
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : Object.entries(data)
            .map(
              ([key, value]) =>
                `${label(key)}: ${Array.isArray(value) ? value.join(" ") : value}`,
            )
            .join(" • ") || "Unable to save. Please retry.",
    );
  }
  return data as T;
}
export type Draft = Omit<Item, "id" | "revision" | "updated_at">;
export const emptyItem = (kind: Kind = "task", owner: Role = "CEO"): Draft => ({
  kind,
  owner,
  title: "",
  owner_name: "",
  status: statuses(kind)[0],
  deadline: null,
  week_start: null,
  details: "",
  next_action: "",
  dependencies: [],
  published_at: null,
  post_url: "",
});
export const scopeSuggestions: Array<[string, Role, string]> = [
  [
    "Viewer sign-in and account recovery",
    "CTO",
    "Acceptance: a viewer can register, sign in, recover access and sign out.",
  ],
  [
    "Film discovery and film detail page",
    "Designer",
    "Acceptance: viewers can discover films, read film information and see the pay-per-view price.",
  ],
  [
    "Pay-per-view purchase and entitlement",
    "CTO",
    "Acceptance: a verified payment unlocks only the purchased film; retries do not duplicate charges or access.",
  ],
  [
    "Protected playback and offline policy",
    "CTO",
    "Acceptance: only entitled viewers can play films. Agree the supported offline experience and protection limits.",
  ],
  [
    "Creator application and rights review",
    "Product / Project Manager",
    "Acceptance: applications and rights confirmations are reviewed before a film is approved.",
  ],
  [
    "Creator revenue and audience visibility",
    "CTO",
    "Acceptance: agree and validate what filmmakers can see about purchases, revenue and audience activity.",
  ],
  [
    "Film conversations and reporting",
    "Designer",
    "Acceptance: approved MVP interactions and report handling are usable and accessible.",
  ],
  [
    "Moderation and admin operations",
    "Product / Project Manager",
    "Acceptance: authorized admins can manage the catalog and act on reports.",
  ],
  [
    "Launch readiness and pilot sign-off",
    "Product / Project Manager",
    "Acceptance: smoke tests, critical blockers, ownership and launch support are reviewed.",
  ],
  [
    "Creator proposition and X launch narrative",
    "CEO",
    "Acceptance: communicate Africa-first distribution, transactional pay-per-view and creator value consistently.",
  ],
];
export const contentTemplates = [
  {
    title: "The problem → our purpose",
    text: "A powerful African film should not disappear after its premiere.\n[Specific distribution problem or observation]\nWe’re building Zuimi to connect African stories with audiences through pay-per-view.\n[One question for filmmakers or film lovers]",
  },
  {
    title: "Build in public",
    text: "This week at Zuimi: [verified progress].\nWhy it matters for [filmmakers / viewers]: [benefit].\nWhat we’re working through: [honest challenge].\nNext: [specific next step].",
  },
  {
    title: "Creator invitation",
    text: "Made an African film? We’d love to hear your story.\nZuimi is building an Africa-first distribution platform where audiences pay for the films they choose.\n[Creator benefit, without an unsupported promise]\nApply to join our creator pipeline: [your tracked campaign link]",
  },
  {
    title: "Start a conversation",
    text: "For African filmmakers: [one specific question about distribution, revenue visibility or finding an audience]?\nWe’re listening as we build Zuimi.\n[Short context that invites a useful reply]",
  },
];
