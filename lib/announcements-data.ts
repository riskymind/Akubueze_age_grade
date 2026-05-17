import prisma from "@/lib/prisma";

export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  publishedAt: Date;
  author: { fullName: string };
  isRead: boolean;
};

export async function getAnnouncements(
  userId: string,
  search?: string,
  filter?: string
): Promise<AnnouncementRow[]> {
  const rows = await prisma.announcement.findMany({
    where: {
      ...(filter === "PINNED" ? { isPinned: true } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { body: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    select: {
      id: true,
      title: true,
      body: true,
      isPinned: true,
      publishedAt: true,
      author: { select: { fullName: true } },
      reads: { where: { userId }, select: { id: true } },
    },
  });

  return rows.map(({ reads, ...rest }) => ({
    ...rest,
    isRead: reads.length > 0,
  }));
}
