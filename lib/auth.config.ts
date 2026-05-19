import type { NextAuthConfig } from "next-auth";
import type { Role, MemberStatus } from "@/lib/generated/prisma/enums";

// Edge-compatible config (no Prisma client imports).
// Used by middleware to read JWT session without a DB call.
export const authConfig = {
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.mustResetPassword = user.mustResetPassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role = token.role as Role;
        session.user.status = token.status as MemberStatus;
        session.user.mustResetPassword = token.mustResetPassword as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
} satisfies NextAuthConfig;
