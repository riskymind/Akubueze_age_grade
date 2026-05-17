import prisma from "@/lib/prisma";

export type MemberRow = {
  id: string;
  fullName: string;
  phone: string | null;
  role: string;
  status: string;
  dateJoined: Date;
};

export async function getMembers(
  search?: string,
  status?: string
): Promise<MemberRow[]> {
  return prisma.user.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status && status !== "ALL"
        ? { status: status as "ACTIVE" | "SUSPENDED" | "INACTIVE" }
        : {}),
    },
    orderBy: { dateJoined: "asc" },
    select: {
      id: true,
      fullName: true,
      phone: true,
      role: true,
      status: true,
      dateJoined: true,
    },
  });
}
