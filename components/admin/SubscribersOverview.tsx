import { useEffect, useState } from "react";
import { generateToken, getSubscribersOverview, Record} from "@/lib/api";
import searchIcon from "@/public/search.svg"
import Image from "next/image";



export default function SubscribersOverview() {

  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredRecords = records.filter((r) =>
  r.name.toLowerCase().includes(search.toLowerCase()) ||
  r.email.toLowerCase().includes(search.toLowerCase()) ||
  r.status.toLowerCase().includes(search.toLowerCase()) ||
  r.dateSubscribed.toLowerCase().includes(search.toLowerCase())
);

   useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await generateToken(); 
        const data = await getSubscribersOverview(token);
        setRecords(data);
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Subscribers Overview</h1>
      

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ">

        <p className="text-left px-6 py-3 font-medium text-sm">Manage your subscribers list</p>

           <div className="relative">

  <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black-200 m-6 mx-6 w-full max-w-7xl bg-[#F3F3F5]"
  />

   {!search && (
                <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center justify-start gap-2 pointer-events-none text-sm text-[#717182] z-10">
                  <Image
                    src={searchIcon}
                    alt="search"
                    width={15}
                    height={15}
                  />
                  <span>Search subscribers...</span>
                </div>
              )}
</div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 w-1/3">Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 w-1/3">Email</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 w-1/4">Date Subscribed</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 w-1/4">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200"> 
            {filteredRecords.map((r, idx) => (
              <tr key={idx} className="hover:bg-gray-50">

                <td className={`px-6 py-4 text-sm ${r.status === "Inactive" ? "text-gray-500" : "text-gray-900"}`}>
                {r.name} {r.email}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">{r.dateSubscribed}</td>

                <td className="px-6 py-4">
                  {r.status === "Active" ? (
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                      Inactive
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
