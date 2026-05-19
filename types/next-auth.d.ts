import { DefaultSession } from "next-auth";
import { Role, MemberStatus } from "@/lib/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      status: MemberStatus;
      mustResetPassword: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    status: MemberStatus;
    mustResetPassword: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    status: MemberStatus;
    mustResetPassword: boolean;
  }
}
