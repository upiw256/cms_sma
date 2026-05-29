import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayoutWrapper from "@/components/dashboard/DashboardLayoutWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayoutWrapper session={session}>
      {children}
    </DashboardLayoutWrapper>
  );
}
