import { redirect } from "next/navigation";
import { operatorIdentity } from "@/lib/server/operator-session";
import ForensicsLaunch from "@/components/operator/ForensicsLaunch";

export default async function ForensicsPage() {
  const user = await operatorIdentity();
  if (user?.role !== "cto") redirect("/operator/login");
  return <ForensicsLaunch />;
}
