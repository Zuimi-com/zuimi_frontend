"use client";
import { extractDate } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

export type NewsletterRow = {
  subject: string;
  dateSent: string;
  status: string;
  openRate?: string;
};

interface NewsletterTableProps {
  rows: NewsletterRow[];
}

function NewsletterTable({ rows }: NewsletterTableProps) {
  const pathname = usePathname();
  const isNewLetterPage = pathname === "/admin/newsletter";
  return (
    <div className="max-w-6xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-2">
          {isNewLetterPage && (
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Newsletter History
            </h1>
          )}
          <p className="text-sm text-gray-600">
            Recent newsletters and their performance
          </p>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">
                Subject
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">
                Date Sent
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">
                Status
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">
                Open Rate
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-6 text-center text-sm text-gray-500"
                >
                  No newsletters found
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td
                    className={`px-6 py-4 text-sm font-medium ${
                      row.status === "Draft" ? "text-gray-500" : "text-gray-900"
                    }`}
                  >
                    {row.subject}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {extractDate(row.dateSent)}
                  </td>
                  <td className="px-6 py-4">
                    {row.status === "Sent" ? (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Sent
                      </span>
                    ) : (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                        Draft
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm ${
                      row.status === "Draft" ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {row.openRate ?? "----"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NewsletterTable;
