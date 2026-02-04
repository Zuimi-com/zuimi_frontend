"use client";
import DocumentEditor from "@/components/editor";
import { NewsletterSendCard } from "@/components/NewsletterSendCard";
import React from "react";

const ComposeLetterHome = () => {
  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Compose NewLetter
      </h1>
      <div className="flex gap-5">
        <DocumentEditor />
        <NewsletterSendCard
          subscribersCount={2500}
          senderName="Zuimi"
          senderEmail="zuimi@company.com"
          onSaveDraft={() => console.log("Draft saved")}
          onSend={() => console.log("Newsletter sent")}
        />
      </div>
    </main>
  );
};

export default ComposeLetterHome;
