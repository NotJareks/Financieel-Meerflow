import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guards";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { id } = await params;

  const pot = await prisma.pot.findFirst({ where: { id, userId: user.id } });
  if (!pot) {
    return NextResponse.json({ error: "Spaarpot niet gevonden." }, { status: 404 });
  }

  // Deleting the pot cascades to transactions; actual-budget references
  // (savedPotId) are set to NULL by the schema's onDelete: SetNull.
  await prisma.pot.delete({ where: { id: pot.id } });

  return NextResponse.json({ ok: true });
}
