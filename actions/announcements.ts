"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function markAnnouncementRead(
  announcementId: string,
  userId: string
) {
  await prisma.announcementRead.upsert({
    where: { announcementId_userId: { announcementId, userId } },
    create: { announcementId, userId },
    update: {},
  });
  revalidatePath("/announcements");
}
