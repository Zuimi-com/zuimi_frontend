"use client";

import { NewsletterSendCard } from "@/components/NewsletterSendCard";
import DocumentEditor from "@/components/editor";
import { useGetNewsletterSummary } from "@/features/dashboard/service/newsletter";
import { useState } from "react";
import { useAdminTutorial } from "@/components/admin/tutorials/AdminTutorialProvider";

export default function ComposeLetterHome() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const { isPlayback } = useAdminTutorial();
  const summary = useGetNewsletterSummary(!isPlayback);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold text-gray-900">Compose Newsletter</h1>
      {summary.isError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          Recipient and sender details could not be loaded. Refresh before sending.
        </p>
      ) : null}
      <div className="flex flex-col gap-5 xl:flex-row">
        <DocumentEditor
          subject={subject}
          onSubjectChange={setSubject}
          onContentChange={setBody}
        />
        <NewsletterSendCard
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

