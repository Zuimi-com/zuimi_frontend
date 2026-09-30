export type AdminCapability = "manage_operators";

export type AdminTutorialStep = {
  target?: string;
  targets?: string[];
  title: string;
  body: string;
  demoState?: string;
};

export type AdminTutorialDefinition = {
  id: string;
  version: number;
  category: string;
  title: string;
  description: string;
  duration: string;
  route: string;
  capability?: AdminCapability;
  steps: AdminTutorialStep[];
};

export type AdminTutorialProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped";

export type AdminTutorialProgress = {
  status: AdminTutorialProgressStatus;
  step: number;
  updatedAt?: string;
};

const step = (
  target: string,
  title: string,
  body: string,
  demoState?: string,
): AdminTutorialStep => ({ target, title, body, demoState });

function catalogTutorial(
  id: string,
  title: string,
  route: string,
  entity: string,
  hasImage: boolean,
): AdminTutorialDefinition {
  const slug = entity.toLowerCase();
  const steps = [
    step(`[data-tutorial="catalog-${slug}-overview"]`, `Manage ${entity.toLowerCase()}`, `This page keeps the ${entity.toLowerCase()} used while preparing movies accurate and available.`),
    step(`[data-tutorial="catalog-${slug}-primary"]`, `${entity === "Genres" ? "Enter the genre name" : "Enter the full name"}`, "Use the official, recognisable value that should appear throughout Zuimi."),
    step(`[data-tutorial="catalog-${slug}-secondary"]`, entity === "Producers" ? "Add the producer email" : entity === "Genres" ? "Describe the genre" : "Add a short biography", "This optional detail helps administrators identify the correct entry."),
  ];
  if (hasImage) {
    steps.push(step(`[data-tutorial="catalog-${slug}-image"]`, "Choose a profile image", "Use a JPG, PNG, or WEBP image up to 5MB."));
  }
  steps.push(
    step(`[data-tutorial="catalog-${slug}-submit"]`, `Add the ${entity.slice(0, -1).toLowerCase()}`, "This saves the entry in normal use. Tutorial playback never submits the form."),
    step(`[data-tutorial="catalog-${slug}-edit"]`, "Start editing", "Edit loads this entry into the form above without changing it yet.", "edit"),
    step(`[data-tutorial="catalog-${slug}-submit"]`, "Save the update", "Review the fields, then use Update in normal use. Tutorial playback keeps the fixture local.", "edit"),
    step(`[data-tutorial="catalog-${slug}-cancel"]`, "Cancel an edit", "Cancel clears the edit state and leaves the saved entry unchanged.", "edit"),
    step(`[data-tutorial="catalog-${slug}-deactivate"]`, "Deactivate an entry", "Deactivation removes the entry from active movie choices without deleting its history.", "deactivate"),
    step('[data-tutorial="catalog-confirm-dialog"]', "Confirm deactivation", "Check the selected entry before confirming. The tutorial never confirms this action.", "deactivate"),
    step(`[data-tutorial="catalog-${slug}-reactivate"]`, "Reactivate an entry", "Use Reactivate when the entry should become available for movie selection again.", "reactivate"),
    step('[data-tutorial="catalog-confirm-dialog"]', "Confirm reactivation", "Confirming restores the entry in normal use. The tutorial leaves all data unchanged.", "reactivate"),
  );
  return {
    id,
    version: 1,
    category: "Catalog management",
    title,
    description: `Add and maintain ${entity.toLowerCase()} used by the movie workflow.`,
    duration: "About 3 minutes",
    route,
    steps,
  };
}

export const ADMIN_TUTORIALS: AdminTutorialDefinition[] = [
  {
    id: "admin-dashboard-overview",
    version: 1,
    category: "Getting started",
    title: "Understand the admin dashboard",
    description: "Learn where to find live newsletter activity, admin tools, help, and account controls.",
    duration: "About 2 minutes",
    route: "/admin",
    steps: [
      step('[data-tutorial="admin-header-identity"]', "Confirm your admin session", "Your account identity appears here so you can confirm which administrator is signed in."),
      step('[data-tutorial="admin-dashboard-stats"]', "Read live activity", "These cards use current subscriber and newsletter data rather than placeholder figures."),
      step('[data-tutorial="admin-compose-shortcut"]', "Start a newsletter", "This shortcut opens newsletter composition. The tutorial does not navigate or create a draft."),
      step('[data-tutorial="admin-sidebar"]', "Use the admin navigation", "The sidebar opens movie publishing, catalog, communications, access, and help tools."),
      step('[data-tutorial="admin-page-help"]', "Ask for help on any page", "Page Help lists the tutorials that apply to the screen you are viewing."),
      step('[data-tutorial="admin-nav-tutorials"]', "Return to Tutorials & Help", "This library keeps every walkthrough available for replay."),
      step('[data-tutorial="admin-logout"]', "Sign out safely", "Use Log Out when you finish. Tutorial playback never signs you out."),
    ],
  },
  {
    id: "admin-create-movie",
    version: 1,
    category: "Movie publishing",
    title: "Create a movie",
    description: "Enter the movie record, cast, classification, artwork, and trailer before uploading the full video.",
    duration: "About 5 minutes",
    route: "/admin/movies",
    steps: [
      step('[data-tutorial="movie-workflow-overview"]', "Follow the three-stage workflow", "Create the record, upload the full video, then prepare and publish it."),
      step('[data-tutorial="movie-tab-details"]', "Open movie details", "Use this tab when you are adding a new movie record.", "details"),
      step('[data-tutorial="movie-title"]', "Enter the movie title", "Use the official title viewers should see."),
      step('[data-tutorial="movie-producer"]', "Choose a producer", "A producer must already exist in the catalog before the movie can be saved."),
      step('[data-tutorial="movie-manage-producers"]', "Manage producer choices", "Open producer management when the required producer is missing. Tutorial playback does not navigate."),
      step('[data-tutorial="movie-release-date"]', "Set the release date", "Choose the movie's official release date."),
      step('[data-tutorial="movie-duration"]', "Enter the duration", "Use a whole number of minutes greater than zero."),
      step('[data-tutorial="movie-price"]', "Set the ZTK price", "Enter a non-negative amount with up to two decimal places."),
      step('[data-tutorial="movie-description"]', "Summarise the story", "Give viewers a concise description of the movie."),
      step('[data-tutorial="movie-director"]', "Choose the director", "Select an active director from the catalog when available."),
      step('[data-tutorial="movie-language"]', "Add the language", "Enter the primary language used in the movie."),
      step('[data-tutorial="movie-rating"]', "Add the rating", "Enter the audience or content rating used by your publishing policy."),
      step('[data-tutorial="movie-genres"]', "Choose genres", "Search and select every genre that applies to the movie."),
      step('[data-tutorial="movie-cast"]', "Choose cast members", "Search and select active actor profiles."),
      step('[data-tutorial="movie-poster"]', "Upload the poster", "Use JPG, PNG, or WEBP up to 10MB."),
      step('[data-tutorial="movie-title-artwork"]', "Upload title artwork", "Use an SVG file up to 2MB."),
      step('[data-tutorial="movie-trailer"]', "Upload the trailer", "Use MP4, MOV, M4V, or WEBM up to 250MB."),
      step('[data-tutorial="movie-save-details"]', "Save the movie record", "This normally saves the details and advances to video upload. The tutorial never submits."),
    ],
  },
  {
    id: "admin-upload-movie-video",
    version: 1,
    category: "Movie publishing",
    title: "Upload or replace a full movie video",
    description: "Attach a full-length source video to a saved movie without publishing it.",
    duration: "About 2 minutes",
    route: "/admin/movies",
    steps: [
      step('[data-tutorial="movie-tab-video"]', "Open full-video upload", "Choose this tab for a movie record that is already saved.", "video"),
      step('[data-tutorial="movie-video-select"]', "Choose the saved movie", "Make sure the selected title matches the source file.", "video"),
      step('[data-tutorial="movie-replacement-warning"]', "Understand replacement", "Replacing an existing source temporarily removes streaming access until the replacement is prepared and published.", "video-replace"),
      step('[data-tutorial="movie-source-file"]', "Choose the full movie", "Select an MP4, MOV, M4V, or MKV source file, not the trailer.", "video-replace"),
      step('[data-tutorial="movie-upload-progress"]', "Keep the page open", "This progress area appears while the source is transferred and saved.", "video-uploading"),
      step('[data-tutorial="movie-upload-submit"]', "Upload the source", "Uploading starts preparation but does not publish the movie. Tutorial playback never uploads.", "video-replace"),
    ],
  },
  {
    id: "admin-prepare-publish-movie",
    version: 1,
    category: "Movie publishing",
    title: "Prepare and publish a movie",
    description: "Monitor an uploaded source, prepare streaming renditions, and publish when ready.",
    duration: "About 3 minutes",
    route: "/admin/movies",
    steps: [
      step('[data-tutorial="movie-processing-queue"]', "Use the processing queue", "Uploaded videos appear here with their current preparation state.", "asset-uploaded"),
      step('[data-tutorial="movie-asset-search"]', "Search uploads", "Find an upload by movie title or source filename.", "asset-uploaded"),
      step('[data-tutorial="movie-asset-filter"]', "Filter by status", "Focus the list on waiting, processing, ready, published, or failed uploads.", "asset-uploaded"),
      step('[data-tutorial="movie-asset-status"]', "Read the status", "The badge and guidance explain the next safe action.", "asset-uploaded"),
      step('[data-tutorial="movie-asset-prepare"]', "Prepare the video", "This starts the saved processing job in normal use. Tutorial playback never starts it.", "asset-uploaded"),
      step('[data-tutorial="movie-asset-status"]', "Wait for Ready", "Status refreshes automatically while streaming renditions are prepared.", "asset-ready"),
      step('[data-tutorial="movie-asset-publish"]', "Publish for viewers", "Publish only after the status is Ready. Tutorial playback never publishes.", "asset-ready"),
    ],
  },
  {
    id: "admin-troubleshoot-movie",
    version: 1,
    category: "Movie publishing",
    title: "Troubleshoot or remove a movie from streaming",
    description: "Review failures, retry preparation, collect support details, or unpublish a movie.",
    duration: "About 3 minutes",
    route: "/admin/movies",
    steps: [
      step('[data-tutorial="movie-asset-status"]', "Recognise a failed upload", "Needs attention means preparation did not complete.", "asset-failed"),
      step('[data-tutorial="movie-asset-retry"]', "Retry preparation", "Use Retry after checking the failure guidance. Tutorial playback never queues a retry.", "asset-failed"),
      step('[data-tutorial="movie-asset-support"]', "Open support details", "Use these identifiers and the recorded error when asking for technical help.", "asset-failed"),
      step('[data-tutorial="movie-asset-job"]', "Copy the processing context", "The upload, movie, and job identifiers locate the exact failed operation.", "asset-failed-open"),
      step('[data-tutorial="movie-asset-status"]', "Recognise a published movie", "Published means the active manifest is available to viewers.", "asset-published"),
      step('[data-tutorial="movie-asset-unpublish"]', "Remove streaming access", "Unpublish removes viewer access without deleting the movie or source. Tutorial playback never activates it.", "asset-published"),
    ],
  },
  catalogTutorial("admin-manage-producers", "Manage producers", "/admin/producers", "Producers", false),
  catalogTutorial("admin-manage-directors", "Manage directors", "/admin/directors", "Directors", true),
  catalogTutorial("admin-manage-actors", "Manage actors", "/admin/actors", "Actors", true),
  catalogTutorial("admin-manage-genres", "Manage genres", "/admin/genres", "Genres", false),
  {
    id: "admin-compose-newsletter",
    version: 1,
    category: "Newsletter and subscribers",
    title: "Compose and save a newsletter draft",
    description: "Write, format, personalise, and safely save a reusable newsletter draft.",
    duration: "About 4 minutes",
    route: "/admin/compose-letter",
    steps: [
      step('[data-tutorial="newsletter-subject"]', "Write the subject", "Use a clear subject that accurately describes the message."),
      step('[data-tutorial="newsletter-content"]', "Write the newsletter", "Create the HTML content that each subscriber will receive."),
      step('[data-tutorial="newsletter-toolbar-bold"]', "Use bold text", "Highlight important words without making the whole message heavy."),
      step('[data-tutorial="newsletter-toolbar-italic"]', "Use italic text", "Add light emphasis where it helps readability."),
      step('[data-tutorial="newsletter-toolbar-strike"]', "Use strikethrough", "Use this only when intentionally showing replaced information."),
      step('[data-tutorial="newsletter-toolbar-link"]', "Add a link", "Select text and provide a trusted HTTPS destination."),
      step('[data-tutorial="newsletter-toolbar-list"]', "Create a list", "Use bullets for short groups of related points."),
      step('[data-tutorial="newsletter-toolbar-image"]', "Insert an image URL", "Paste a copied URL from the newsletter image gallery."),
      step('[data-tutorial="newsletter-personalization"]', "Personalise greetings", "Use {{name}}, {{full_name}}, {{first_name}}, or {{last_name}}; Zuimi resolves them per recipient."),
      step('[data-tutorial="newsletter-save-draft"]', "Save the draft", "Saving keeps the subject and content without emailing anyone. Tutorial playback never saves."),
    ],
  },
  {
    id: "admin-send-newsletter",
    version: 1,
    category: "Newsletter and subscribers",
    title: "Review and send a newsletter",
    description: "Check recipients and sender information, then confirm a single delivery.",
    duration: "About 2 minutes",
    route: "/admin/compose-letter",
    steps: [
      step('[data-tutorial="newsletter-recipients"]', "Review recipients", "The current subscriber total is loaded from Zuimi before sending."),
      step('[data-tutorial="newsletter-sender"]', "Confirm the sender", "Check the configured sender name and email."),
      step('[data-tutorial="newsletter-validation"]', "Complete the required content", "A subject and non-empty message are required before sending."),
      step('[data-tutorial="newsletter-send"]', "Prepare to send", "This opens a final confirmation. Tutorial playback never opens a live send request.", "send-ready"),
      step('[data-tutorial="newsletter-send-confirm"]', "Confirm one delivery", "The server accepts a draft only once, preventing accidental double sends.", "send-confirm"),
      step('[data-tutorial="newsletter-delivery-status"]', "Watch delivery status", "Zuimi reports whether the newsletter was queued or sent and records failures without automatic ambiguous retries.", "send-status"),
    ],
  },
  {
    id: "admin-newsletter-history",
    version: 1,
    category: "Newsletter and subscribers",
    title: "Review newsletter history",
    description: "Understand saved drafts and the delivery state of submitted newsletters.",
    duration: "About 2 minutes",
    route: "/admin/newsletter",
    steps: [
      step('[data-tutorial="newsletter-history"]', "Review newsletter history", "This table contains real broadcasts rather than subscriber rows."),
      step('[data-tutorial="newsletter-history-subject"]', "Identify the newsletter", "Use the subject to find the intended broadcast."),
      step('[data-tutorial="newsletter-history-status"]', "Read delivery status", "Draft, queued, sent, and failed each describe a distinct delivery state."),
      step('[data-tutorial="newsletter-history-created"]', "Check when it was created", "Draft creation time helps distinguish similar messages."),
      step('[data-tutorial="newsletter-history-sent"]', "Check when it was sent", "This remains blank until delivery completes."),
      step('[data-tutorial="newsletter-history-counts"]', "Review recipient counts", "Compare intended recipients with successful sends."),
    ],
  },
  {
    id: "admin-review-subscribers",
    version: 1,
    category: "Newsletter and subscribers",
    title: "Review subscribers",
    description: "Review the people who will receive a newsletter and when they joined.",
    duration: "About 1 minute",
    route: "/admin/subscribers",
    steps: [
      step('[data-tutorial="subscriber-overview"]', "Review subscribers", "This list shows the current waitlist subscribers available for newsletter delivery."),
      step('[data-tutorial="subscriber-total"]', "Check the total", "This count matches the valid recipient list."),
      step('[data-tutorial="subscriber-email"]', "Review the email", "Confirm the address represented by each row."),
      step('[data-tutorial="subscriber-date"]', "Review the subscription date", "This shows when the address joined the list."),
    ],
  },
  {
    id: "admin-newsletter-images",
    version: 1,
    category: "Newsletter and subscribers",
    title: "Upload and reuse newsletter images",
    description: "Upload validated images, copy their hosted links, and insert them into newsletters.",
    duration: "About 3 minutes",
    route: "/admin/images",
    steps: [
      step('[data-tutorial="image-picker"]', "Choose newsletter images", "Select JPG, PNG, GIF, or WEBP images up to 5MB each."),
      step('[data-tutorial="image-preview"]', "Review previews", "Check every selected image before uploading.", "images-selected"),
      step('[data-tutorial="image-remove"]', "Remove a selection", "Remove any incorrect image without affecting uploaded media.", "images-selected"),
      step('[data-tutorial="image-upload"]', "Upload selected images", "Files are uploaded individually so a failed file does not hide successful ones. Tutorial playback never uploads.", "images-selected"),
      step('[data-tutorial="image-gallery"]', "Browse uploaded images", "The gallery shows reusable newsletter media.", "images-gallery"),
      step('[data-tutorial="image-copy-link"]', "Copy an image link", "Copy the hosted URL, then insert it from the newsletter editor.", "images-gallery"),
      step('[data-tutorial="image-pagination"]', "Move through the gallery", "Use Previous and Next when the library contains more than one page.", "images-gallery"),
    ],
  },
  {
    id: "admin-invite-operator",
    version: 1,
    category: "Access administration",
    title: "Invite an operator",
    description: "Invite a report moderator or CTO without sharing a password.",
    duration: "About 2 minutes",
    route: "/admin/operators",
    capability: "manage_operators",
    steps: [
      step('[data-tutorial="operator-invite-overview"]', "Invite an operator", "Only administrators with operator-management permission can use this area."),
      step('[data-tutorial="operator-email"]', "Enter the operator email", "Use the address the operator controls."),
      step('[data-tutorial="operator-role"]', "Choose the role", "Report moderators review reports; CTO operators access the separate forensics workspace."),
      step('[data-tutorial="operator-invite-submit"]', "Send the invitation", "Zuimi emails a single-use setup link that expires after 24 hours. Tutorial playback never sends it."),
      step('[data-tutorial="operator-pending"]', "Track the pending invitation", "Pending remains until the invited person sets a password.", "operator-pending"),
    ],
  },
  {
    id: "admin-manage-operator-access",
    version: 1,
    category: "Access administration",
    title: "Enable or disable operator access",
    description: "Understand operator states and safely change access.",
    duration: "About 2 minutes",
    route: "/admin/operators",
    capability: "manage_operators",
    steps: [
      step('[data-tutorial="operator-accounts"]', "Review operator accounts", "Each row shows the assigned role and current access state.", "operator-active"),
      step('[data-tutorial="operator-state"]', "Understand account states", "Active can sign in, Invitation pending has not completed setup, and Disabled cannot use operator credentials.", "operator-active"),
      step('[data-tutorial="operator-toggle"]', "Change operator access", "Disabling revokes access and refresh-token use. Tutorial playback never changes it.", "operator-disable"),
      step('[data-tutorial="operator-confirm"]', "Confirm the access change", "Check the email and consequence before disabling an account.", "operator-disable"),
      step('[data-tutorial="operator-toggle"]', "Re-enable an operator", "Enable restores an accepted account or allows a pending invitation to remain usable.", "operator-disabled"),
    ],
  },
];

export function adminTutorialById(id: string | null | undefined) {
  return ADMIN_TUTORIALS.find((tutorial) => tutorial.id === id) ?? null;
}

export function tutorialsForRoute(
  route: string,
  capabilities: Partial<Record<AdminCapability, boolean>>,
) {
  return ADMIN_TUTORIALS.filter(
    (tutorial) =>
      tutorial.route === route &&
      (!tutorial.capability || capabilities[tutorial.capability] === true),
  );
}

export function visibleAdminTutorials(
  capabilities: Partial<Record<AdminCapability, boolean>>,
) {
  return ADMIN_TUTORIALS.filter(
    (tutorial) => !tutorial.capability || capabilities[tutorial.capability] === true,
  );
}

export function normalizeAdminTutorialProgress(
  value: unknown,
  stepCount: number,
): AdminTutorialProgress {
  if (!value || typeof value !== "object") {
    return { status: "not_started", step: 0 };
  }
  const candidate = value as Partial<AdminTutorialProgress>;
  const allowed: AdminTutorialProgressStatus[] = [
    "not_started",
    "in_progress",
    "completed",
    "skipped",
  ];
  const status = allowed.includes(candidate.status as AdminTutorialProgressStatus)
    ? (candidate.status as AdminTutorialProgressStatus)
    : "not_started";
  const rawStep = Number.isInteger(candidate.step) ? Number(candidate.step) : 0;
  return {
    status,
    step: Math.max(0, Math.min(Math.max(0, stepCount - 1), rawStep)),
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : undefined,
  };
}

export function adminTutorialProgressKey(
  adminId: string,
  tutorial: AdminTutorialDefinition,
) {
  return `zuimi:admin-tutorial:${adminId}:${tutorial.id}:v${tutorial.version}`;
}

