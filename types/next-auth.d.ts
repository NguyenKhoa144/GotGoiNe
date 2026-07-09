import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: "admin";
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin";
  }
}
