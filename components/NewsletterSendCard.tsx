"use client";

import { useAdminTutorial } from "@/components/admin/tutorials/AdminTutorialProvider";
import {
  useSaveNewsletterDraft,
  useSendNewsletter,
} from "@/features/dashboard/service/newsletter";
import { useEditorStore } from "@/store/use-editor";
import { Loader2, SaveAll, Send, Users, X } from "lucide-react";
import { useState } from "react";

export function NewsletterSendCard({
  subject,
  subscribersCount,
  senderName,
  senderEmail,
}: {
  subject: string;
  subscribersCount: number;
  senderName: string;
  senderEmail: string;
}) {
  const { editor } = useEditorStore();
  const { isPlayback, demoState } = useAdminTutorial();
  const saveDraft = useSaveNewsletterDraft();
  const sendNewsletter = useSendNewsletter();
  const [draftId, setDraftId] = useState<string>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");

  const body = editor?.getHTML() || "";
  const hasContent = Boolean(editor?.getText().trim());
  const valid = Boolean(subject.trim() && hasContent);
  const busy = saveDraft.isPending || sendNewsletter.isPending;
  const showConfirmation = confirmOpen || demoState === "send-confirm";

  const persistDraft = async () => {
    if (!valid || isPlayback) return null;
    const saved = await saveDraft.mutateAsync({
      id: draftId,
      subject: subject.trim(),
      body,
    });
    setDraftId(saved.id);
    setMessage("Draft saved.");
    return saved.id;
  };

  const handleSave = async () => {
    if (!valid) {
      setMessage("Add a subject and newsletter content before saving.");
      return;
    }
    try {
      await persistDraft();
    } catch {
      setMessage("The draft could not be saved. Review the content and try again.");
    }
  };

  const handleConfirmSend = async () => {
    if (isPlayback) return;
    try {
      const id = await persistDraft();
      if (!id) return;
      const result = await sendNewsletter.mutateAsync(id);
      setConfirmOpen(false);
      setMessage(
        result.status === "queued"
          ? "Newsletter queued for delivery."
          : `Newsletter sent to ${(result.sent_count ?? subscribersCount).toLocaleString()} subscribers.`,
      );
    } catch {
      setConfirmOpen(false);
      setMessage("The newsletter could not be submitted for delivery.");
    }
  };

  return (
    <aside className="max-w-md space-y-6 bg-white">
      <div
        data-tutorial="newsletter-recipients"
        className="space-y-5 rounded-[14.78px] border p-5 pb-10"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Users />
          <span>Recipients</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Subscribers</span>
          <span className="font-bold text-gray-900">
            {(isPlayback ? 2500 : subscribersCount).toLocaleString()}
          </span>
        </div>
        <div className="rounded-lg bg-[#E8F3FD] px-4 py-3 text-sm text-[#1684EF]">
          The newsletter will be sent to every current subscriber.
        </div>
      </div>

      <div
        data-tutorial="newsletter-sender"
        className="space-y-5 rounded-[14.78px] border p-5"
      >
        <h3 className="text-sm font-semibold text-gray-800">Sender</h3>
        <label className="block space-y-1">
          <span className="text-xs text-gray-500">Sender name</span>
          <input value={senderName || "Zuimi"} disabled className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-gray-500">Sender email</span>
          <input value={senderEmail || "Not configured"} disabled className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm" />
        </label>
      </div>

      <div
        data-tutorial="newsletter-validation"
        className="space-y-4 rounded-[14.78px] border p-5"
      >
        <p className="text-xs text-gray-600">
          A subject and non-empty message are required. Sending always saves the latest draft first.
        </p>
        <button
          type="button"
          data-tutorial="newsletter-save-draft"
          onClick={handleSave}
          disabled={busy || isPlayback || !valid}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 disabled:opacity-50"
        >
          {saveDraft.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveAll className="h-4 w-4" />}
          Save Draft
        </button>
        <button
          type="button"
          data-tutorial="newsletter-send"
          onClick={() => !isPlayback && setConfirmOpen(true)}
          disabled={busy || isPlayback || !valid}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1684EF] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Send to {(isPlayback ? 2500 : subscribersCount).toLocaleString()} Subscribers
        </button>
        {(message || demoState === "send-status") ? (
          <p
            data-tutorial="newsletter-delivery-status"
            role="status"
            className="rounded-lg bg-blue-50 px-3 py-2 text-center text-xs text-blue-800"
          >
            {demoState === "send-status" ? "Newsletter queued for delivery." : message}
          </p>
        ) : null}
      </div>

      {showConfirmation ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <section
            data-tutorial="newsletter-send-confirm"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Send this newsletter?</h2>
                <p className="mt-2 text-sm text-slate-600">
                  “{subject || "Newsletter subject"}” will be submitted once for delivery to {(isPlayback ? 2500 : subscribersCount).toLocaleString()} subscribers.
                </p>
              </div>
              <button type="button" onClick={() => !isPlayback && setConfirmOpen(false)} aria-label="Close confirmation">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => !isPlayback && setConfirmOpen(false)} className="rounded-lg border px-4 py-2 text-sm">
                Cancel
              </button>
              <button type="button" disabled={busy || isPlayback} onClick={handleConfirmSend} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "Submitting…" : "Confirm send"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </aside>
  );
}

