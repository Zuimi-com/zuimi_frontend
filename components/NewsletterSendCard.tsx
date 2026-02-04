import { SaveAll, Send, Users } from "lucide-react";
import React from "react";

type NewsletterSendCardProps = {
  subscribersCount: number;
  senderName: string;
  senderEmail: string;
  onSaveDraft?: () => void;
  onSend?: () => void;
};

export const NewsletterSendCard: React.FC<NewsletterSendCardProps> = ({
  subscribersCount,
  senderName,
  senderEmail,
  onSaveDraft,
  onSend,
}) => {
  return (
    <div className="max-w-md space-y-6 bg-white">
      {/* Recipients */}
      <div className="border p-5 pb-10 space-y-5 rounded-[14.78px]">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Users />
          <span>Recipients</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 ">
          <span>Active Subscribers</span>
          <span className="font-bold text-gray-900">
            {subscribersCount.toLocaleString()}
          </span>
        </div>

        <div className="rounded-lg bg-[#E8F3FD] px-4 py-3 text-sm text-[#1684EF]">
          Your newsletter will be sent to all active subscribers.
        </div>
      </div>

      {/* Settings */}
      <div className="border p-5 space-y-5 rounded-[14.78px]">
        <h3 className="text-sm font-semibold text-gray-800">Settings</h3>

        <div className="space-y-1">
          <label className="text-xs text-gray-500">Sender Name</label>
          <input
            value={senderName}
            disabled
            className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500">Sender Email</label>
          <input
            value={senderEmail}
            disabled
            className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="border p-5 space-y-5 rounded-[14.78px]">
        <button
          onClick={onSaveDraft}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <SaveAll /> Save Draft
        </button>
        <button
          onClick={onSend}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1684EF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1684EF]"
        >
          <Send /> Send to {subscribersCount.toLocaleString()} Subscribers
        </button>

        <p className="text-center text-xs text-gray-500">
          Newsletter will be sent immediately
        </p>
      </div>
    </div>
  );
};
