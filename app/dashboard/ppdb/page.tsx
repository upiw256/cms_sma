import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PpdbDashboardClient from "./PpdbDashboardClient";

export const metadata = {
  title: "Manajemen PPDB — Daftar Ulang",
  description: "Dashboard admin untuk verifikasi daftar ulang calon siswa PPDB.",
};

export default async function PpdbDashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return <PpdbDashboardClient session={session} />;
}
