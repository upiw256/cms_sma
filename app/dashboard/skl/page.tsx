import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SklDashboardClient from "./SklDashboardClient";

export const metadata = {
  title: "Dashboard SKL",
};

export default async function SklDashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return <SklDashboardClient session={session} />;
}
