import { useEffect, useState } from "react";
import { getNewsletterHistory, Row} from "@/lib/api";
import Cookies from "js-cookie";



export default function NewsletterHistory() {

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("access_token") || "";
        const data = await getNewsletterHistory(token);
        setRows(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  


  return (
    <div className="max-w-8xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Newsletter History</h1>
      

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ">
        <p className="text-left px-6 py-3 font-medium text-sm">Recent newsletters and there performance</p>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 w-1/2">Subject</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 w-1/6">Date Sent</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 w-1/6">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 w-1/6">Open Rate</th>
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
