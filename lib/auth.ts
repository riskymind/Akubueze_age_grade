import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { MemberStatus } from "@/lib/generated/prisma/enums";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!passwordMatch) return null;

        if (user.status === MemberStatus.SUSPENDED) {
          throw new Error("AccountSuspended");
        }
        if (user.status === MemberStatus.INACTIVE) {
          throw new Error("AccountInactive");
        }

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          mustResetPassword: user.mustResetPassword,
        };
      },
    }),
  ],
});
