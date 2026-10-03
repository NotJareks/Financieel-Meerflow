import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { formatDate } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateInviteForm } from "@/components/admin/create-invite-form";
import {
  CopyInviteButton,
  RevokeInviteButton,
} from "@/components/admin/invite-actions";

export default async function AdminInvitesPage() {
  await requireAdmin();

  const invites = await prisma.inviteCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true, email: true } },
    },
  });

  const now = new Date();

  function isActive(invite: (typeof invites)[number]): boolean {
    return (
      invite.revokedAt === null &&
      (invite.expiresAt === null || invite.expiresAt > now) &&
      invite.uses < invite.maxUses
    );
  }

  return (
    <>
      <CreateInviteForm />

      <div className="panel mt-6">
        <div className="mb-6">
          <span className="eyebrow">OVERZICHT</span>
          <h2 className="text-2xl">Uitnodigingen</h2>
        </div>

        {invites.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nog geen uitnodigingen aangemaakt.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Gebruik</TableHead>
                <TableHead>Verloopt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notitie</TableHead>
                <TableHead>Aangemaakt door</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>
                    <span className="font-mono text-sm tracking-wider text-accent-light">
                      {invite.code}
                    </span>
                  </TableCell>
                  <TableCell>
                    {invite.role === "ADMIN" ? "Beheerder" : "Gebruiker"}
                  </TableCell>
                  <TableCell>
                    {invite.uses} / {invite.maxUses}
                  </TableCell>
                  <TableCell>
                    {invite.expiresAt ? formatDate(invite.expiresAt) : "Nooit"}
                  </TableCell>
                  <TableCell>
                    {invite.revokedAt ? (
                      <Badge variant="destructive">Ingetrokken</Badge>
                    ) : isActive(invite) ? (
                      <Badge variant="success">Actief</Badge>
                    ) : invite.uses >= invite.maxUses ? (
                      <Badge variant="secondary">Opgebruikt</Badge>
                    ) : invite.expiresAt && invite.expiresAt <= now ? (
                      <Badge variant="secondary">Verlopen</Badge>
                    ) : (
                      <Badge variant="secondary">Inactief</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-muted-foreground">
                    {invite.note || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {invite.createdBy.name || invite.createdBy.email}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <CopyInviteButton code={invite.code} />
                      <RevokeInviteButton
                        inviteId={invite.id}
                        alreadyRevoked={invite.revokedAt !== null}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
