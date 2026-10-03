import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration.
 * Used both by the full NextAuth instance (auth.ts) and the middleware.
 * No Prisma / Node-only imports in here.
 */
export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
  // Real secret comes from AUTH_SECRET at runtime; the fallback only
  // keeps `next build` working in isolated build environments (Docker).
  secret: process.env.AUTH_SECRET || "build-only-secret-change-me",
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id;
        token.role = (user as { role?: "ADMIN" | "USER" }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "ADMIN" | "USER") ?? "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
