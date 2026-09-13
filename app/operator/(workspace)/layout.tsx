import { redirect } from "next/navigation";
import { operatorIdentity } from "@/lib/server/operator-session";
import OperatorLogout from "@/components/operator/OperatorLogout";

export default async function OperatorWorkspace({ children }: { children: React.ReactNode }) {
  const user = await operatorIdentity();
  if (!user) redirect("/operator/login");
  return <div className="min-h-screen bg-slate-100 text-slate-900">
    <header className="bg-slate-950 px-6 py-4 text-white flex items-center justify-between">
      <strong>Zuimi · {user.role === "moderator" ? "Report review" : "Forensics"}</strong>
      <div className="flex items-center gap-4"><span>{user.email}</span><OperatorLogout /></div>
    </header>{children}
  </div>;
}
