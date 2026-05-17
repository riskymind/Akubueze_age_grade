import { startOfMonth, endOfMonth } from "date-fns";
import prisma from "@/lib/prisma";
import { PaymentType, PaymentStatus } from "@/lib/generated/prisma/client";

export type PaymentRow = {
  id: string;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  paidAt: Date | null;
  createdAt: Date;
  receiptUrl: string | null;
  user: {
    id: string;
    fullName: string;
  };
};

export type PaymentStats = {
  totalCollected: number;
  outstandingDues: number;
  finesThisMonth: number;
};

export async function getPayments(
  userId: string,
  isAdmin: boolean,
  type?: string
): Promise<PaymentRow[]> {
  return prisma.payment.findMany({
    where: {
      ...(isAdmin ? {} : { userId }),
      ...(type && type !== "ALL" ? { type: type as PaymentType } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      status: true,
      amount: true,
      paidAt: true,
      createdAt: true,
      receiptUrl: true,
      user: {
        select: { id: true, fullName: true },
      },
    },
  });
}

export async function getPaymentStats(
  userId: string,
  isAdmin: boolean
): Promise<PaymentStats> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const userFilter = isAdmin ? {} : { userId };

  const [paidResult, pendingResult, finesResult] = await Promise.all([
    prisma.payment.aggregate({
      where: { ...userFilter, status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { ...userFilter, status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        ...userFilter,
        type: "FINE",
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalCollected: paidResult._sum.amount ?? 0,
    outstandingDues: pendingResult._sum.amount ?? 0,
    finesThisMonth: finesResult._sum.amount ?? 0,
  };
}
