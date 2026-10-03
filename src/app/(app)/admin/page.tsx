import Link from "next/link";
import { KeyRound, UserPlus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { formatDate } from "@/lib/dates";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const now = new Date();
  const [userCount, activeInvites, recentRegistrations] = await Promise.all([
    prisma.user.count(),
    prisma.inviteCode.count({
      where: {
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        uses: { lt: prisma.inviteCode.fields.maxUses },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    {
      label: "Gebruikers",
      value: String(userCount),
      description: "Totaal aantal accounts.",
      icon: Users,
      href: "/admin/users",
    },
    {
      label: "Actieve uitnodigingen",
      value: String(activeInvites),
      description: "Niet ingetrokken, niet verlopen en nog bruikbaar.",
      icon: KeyRound,
      href: "/admin/invites",
    },
  ];

  return (
    <>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="luxury-card group p-7 transition-all hover:-translate-y-0.5 hover:border-accent/25"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="card-label">{stat.label}</div>
                <div className="mt-4 font-serif text-5xl text-accent-light">
                  {stat.value}
                </div>
                <p className="mt-3 text-[0.8rem] text-muted-foreground">
                  {stat.description}
                </p>
              </div>
              <stat.icon className="h-5 w-5 text-accent/60" />
            </div>
          </Link>
        ))}
      </div>

      <div className="panel">
        <div className="mb-6">
          <span className="eyebrow">RECENT</span>
          <h2 className="text-2xl">Recente registraties</h2>
        </div>

        {recentRegistrations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nog geen registraties.
          </p>
        ) : (
          <div>
            {recentRegistrations.map((user) => (
              <div
                key={user.id}
                className="flex flex-col justify-between gap-2 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white/[0.03] text-sm text-accent">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <strong className="text-sm font-medium">
                      {user.name || "Onbekend"}
                    </strong>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{user.role === "ADMIN" ? "Beheerder" : "Gebruiker"}</span>
                  <span>·</span>
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
