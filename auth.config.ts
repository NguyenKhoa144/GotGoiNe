import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isOnAdmin = request.nextUrl.pathname.startsWith("/admin");
      if (isOnAdmin) return auth?.user?.role === "admin";
      return true;
    },
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.role = token.role as "admin";
      return session;
    },
  },
} satisfies NextAuthConfig;
