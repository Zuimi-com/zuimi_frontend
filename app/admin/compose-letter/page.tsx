"use client";

import { NewsletterSendCard } from "@/components/NewsletterSendCard";
import DocumentEditor from "@/components/editor";
import SectionSkeleton from "@/components/admin/SectionSkeleton";
import { useGetBroadcast, useGetNewsletterSummary } from "@/features/dashboard/service/newsletter";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { NewsletterBroadcast } from "@/features/dashboard/service/newsletter";
import { useAdminTutorial } from "@/components/admin/tutorials/AdminTutorialProvider";

export default function ComposeLetterHome() {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <ComposeLetterRoute />
    </Suspense>
  );
}

function ComposeLetterRoute() {
  const params = useSearchParams();
  const { isPlayback } = useAdminTutorial();
  const draftId = isPlayback ? null : params.get("draft");
  const draft = useGetBroadcast(draftId);

  if (draftId && draft.isPending) return <SectionSkeleton />;
  if (draftId && (draft.isError || draft.data?.status !== "DRAFT")) {
    return (
      <div className="space-y-3">
        <p role="alert">This newsletter draft is unavailable for editing.</p>
        <Link href="/admin/newsletter" className="text-blue-700 hover:underline">
          Return to newsletter history
        </Link>
      </div>
    );
  }

  return <ComposeLetterForm key={draftId ?? "new"} draft={draftId ? draft.data : undefined} />;
}

function ComposeLetterForm({ draft }: { draft?: NewsletterBroadcast }) {
  const [subject, setSubject] = useState(draft?.subject ?? "");
  const [body, setBody] = useState(draft?.body ?? "");
  const { isPlayback } = useAdminTutorial();
  const summary = useGetNewsletterSummary(!isPlayback);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold text-gray-900">{draft ? "Edit Newsletter Draft" : "Compose Newsletter"}</h1>
      {summary.isError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          Recipient and sender details could not be loaded. Refresh before sending.
        </p>
      ) : null}
      <div className="flex flex-col gap-5 xl:flex-row">
        <DocumentEditor
          subject={subject}
          initialContent={draft?.body}
          onSubjectChange={setSubject}
          onContentChange={setBody}
        />
        <NewsletterSendCard
          initialDraftId={draft?.id}
          subject={subject}
          body={body}
          subscribersCount={summary.data?.subscriber_count ?? 0}
          senderName={summary.data?.sender_name ?? "Zuimi"}
          senderEmail={summary.data?.sender_email ?? ""}
        />
      </div>
    </main>
  );
}

