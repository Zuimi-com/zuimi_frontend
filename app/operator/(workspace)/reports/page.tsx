import { redirect } from "next/navigation";
import { operatorIdentity } from "@/lib/server/operator-session";
import ReportQueue from "@/components/operator/ReportQueue";

export default async function ReportsPage() {
  const user = await operatorIdentity();
  if (user?.role !== "moderator") redirect("/operator/login");
  return <ReportQueue />;
}
