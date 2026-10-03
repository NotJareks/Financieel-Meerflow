import { redirect } from "next/navigation";
import { auth } from "@/auth";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: "ADMIN" | "USER";
};

/** Returns the current session user or redirects to /login. */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) redirect("/login");
  return {
    id: user.id,
    email: user.email ?? "",
    name: user.name ?? null,
    role: user.role ?? "USER",
  };
}

/** Returns the current session user if logged in, otherwise null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;
  return {
    id: user.id,
    email: user.email ?? "",
    name: user.name ?? null,
    role: user.role ?? "USER",
  };
}

/** Returns the current session user or redirects away if not admin. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
