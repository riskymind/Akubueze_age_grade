import { Suspense } from "react";
import { Pin } from "lucide-react";
import { getCurrentUser } from "@/lib/dashboard-data";
import { getAnnouncements } from "@/lib/announcements-data";
import { AnnouncementsFilterBar } from "@/components/announcements/AnnouncementsFilterBar";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    filter?: string;
  }>;
}

export default async function AnnouncementsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const user = await getCurrentUser();

  const announcements = await getAnnouncements(
    user.id,
    resolvedParams.search,
    resolvedParams.filter
  );

  const pinned = announcements.filter((a) => a.isPinned);
  const others = announcements.filter((a) => !a.isPinned);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Announcements
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Stay updated with important association news
        </p>
      </div>

      {/* Filter bar */}
      <Suspense>
        <AnnouncementsFilterBar />
      </Suspense>

      {/* Empty state */}
      {announcements.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No announcements found.
        </div>
      )}

      {/* Pinned announcements */}
      {pinned.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="size-4 text-muted-foreground rotate-45" />
            <h2 className="text-sm font-semibold text-foreground">
              Pinned Announcements
            </h2>
          </div>
          <div className="space-y-3">
            {pinned.map((a) => (
              <AnnouncementCard
                key={a.id}
                id={a.id}
                title={a.title}
                body={a.body}
                isPinned={a.isPinned}
                publishedAt={a.publishedAt}
                authorName={a.author.fullName}
                isRead={a.isRead}
                userId={user.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Other announcements */}
      {others.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Other Announcements
          </h2>
          <div className="space-y-3">
            {others.map((a) => (
              <AnnouncementCard
                key={a.id}
                id={a.id}
                title={a.title}
                body={a.body}
                isPinned={a.isPinned}
                publishedAt={a.publishedAt}
                authorName={a.author.fullName}
                isRead={a.isRead}
                userId={user.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
