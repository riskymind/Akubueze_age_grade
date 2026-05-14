export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 shrink-0 border-r border-border">
        <h2 className="p-6 text-lg font-semibold text-foreground">Sidebar</h2>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <h2 className="p-6 text-lg font-semibold text-foreground">Main</h2>
        {children}
      </main>
    </div>
  );
}
