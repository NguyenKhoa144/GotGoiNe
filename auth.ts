import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "./lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Tên đăng nhập" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username;
        const password = credentials?.password;
        if (typeof username !== "string" || typeof password !== "string") {
          return null;
        }

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPasswordHashB64 = process.env.ADMIN_PASSWORD_HASH_B64;
        if (adminUsername && adminPasswordHashB64 && username === adminUsername) {
          const adminPasswordHash = Buffer.from(adminPasswordHashB64, "base64").toString("utf-8");
          const valid = await bcrypt.compare(password, adminPasswordHash);
          if (!valid) return null;
          return { id: "admin", name: adminUsername, role: "admin" };
        }

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.fullName, role: "user" };
      },
    }),
  ],
});
