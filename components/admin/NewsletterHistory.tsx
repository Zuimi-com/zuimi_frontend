type Row = {
  subject: string;
  dateSent: string;
  status: "Sent" | "Draft";
  openRate?: string;
};

const rows: Row[] = [
  { subject: "New African Films This Week", dateSent: "April 12, 2026", status: "Sent", openRate: "96%" },
  { subject: "Trending movies", dateSent: "March 30, 2026", status: "Sent", openRate: "80%" },
  { subject: "New releases this week", dateSent: "March 12, 2026", status: "Draft" },
];

export default function NewsletterHistory() {
  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Newsletter History</h1>
      <p className="text-sm text-gray-600 mb-6">Recent newsletters and their performance</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">Subject</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">Date Sent</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">Open Rate</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {rows.map((r, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className={`px-6 py-4 text-sm ${r.status === "Draft" ? "text-gray-500" : "text-gray-900"}`}>
                  {r.subject}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{r.dateSent}</td>
                <td className="px-6 py-4">
                  {r.status === "Sent" ? (
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Sent
                    </span>
                  ) : (
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                      Draft
                    </span>
                  )}
                </td>
                <td className={`px-6 py-4 text-sm ${r.status === "Draft" ? "text-gray-500" : "text-gray-900"}`}>
                  {r.openRate ?? "----"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
