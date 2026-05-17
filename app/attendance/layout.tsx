import { AppSidebar } from "@/components/layout/AppSidebar";
import { getCurrentUser } from "@/lib/dashboard-data";

export default async function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar user={user} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
