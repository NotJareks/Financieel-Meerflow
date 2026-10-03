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
import { UserActions } from "@/components/admin/user-actions";

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      disabled: true,
      createdAt: true,
      _count: { select: { pots: true } },
    },
  });

  return (
    <div className="panel">
      <div className="mb-6">
        <span className="eyebrow">ACCOUNTS</span>
        <h2 className="text-2xl">Gebruikers</h2>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nog geen gebruikers.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Spaarpotten</TableHead>
              <TableHead>Aangemaakt</TableHead>
              <TableHead className="text-right">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {user.name || "Onbekend"}
                    </span>
                    {user.id === currentUser.id && (
                      <Badge variant="outline" className="text-accent">
                        jij
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  {user.role === "ADMIN" ? (
                    <Badge>Beheerder</Badge>
                  ) : (
                    <Badge variant="secondary">Gebruiker</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.disabled ? (
                    <Badge variant="destructive">Uitgeschakeld</Badge>
                  ) : (
                    <Badge variant="success">Actief</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user._count.pots}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <UserActions
                    userId={user.id}
                    role={user.role}
                    disabled={user.disabled}
                    isSelf={user.id === currentUser.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
