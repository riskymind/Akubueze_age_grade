import { Suspense } from "react";
import { Eye, Pencil, Ban } from "lucide-react";
import { getCurrentUser } from "@/lib/dashboard-data";
import { getMembers } from "@/lib/members-data";
import { MembersSearchBar } from "@/components/members/MembersSearchBar";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Active
      </span>
    );
  }
  if (status === "SUSPENDED") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
        Suspended
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
      Inactive
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "MEMBER") {
    return (
      <span className="text-xs px-1.5 py-0.5 rounded border border-border text-muted-foreground">
        Member
      </span>
    );
  }
  return null;
}

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function MembersPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const user = await getCurrentUser();
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";

  const members = await getMembers(resolvedParams.search, resolvedParams.status);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Members</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage association members
        </p>
      </div>

      {/* Search + Filter */}
      <Suspense>
        <MembersSearchBar />
      </Suspense>

      {/* Members List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {members.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No members found.
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <ul className="md:hidden divide-y divide-border">
              {members.map((member) => (
                <li key={member.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {member.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.phone ?? "—"}
                      </p>
                    </div>
                    <StatusBadge status={member.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RoleBadge role={member.role} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(member.dateJoined)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="View"
                      >
                        <Eye className="size-4" />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Edit"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Suspend"
                          >
                            <Ban className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop: table */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {member.fullName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={member.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(member.dateJoined)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="View"
                        >
                          <Eye className="size-4" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Edit"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Suspend"
                            >
                              <Ban className="size-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
