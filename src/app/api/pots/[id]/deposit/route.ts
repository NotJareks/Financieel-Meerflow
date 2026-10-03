import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guards";
import { potDepositSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const parsed = potDepositSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." },
      { status: 400 }
    );
  }

  const { amountCents, description, date } = parsed.data;

  const [pot, currentUser] = await Promise.all([
    prisma.pot.findFirst({ where: { id, userId: user.id } }),
    prisma.user.findUnique({ where: { id: user.id } }),
  ]);

  if (!pot || !currentUser) {
    return NextResponse.json({ error: "Spaarpot niet gevonden." }, { status: 404 });
  }

  // Use existing unallocated money first.
  const fromUnallocated = Math.min(currentUser.unallocatedCents, amountCents);

  await prisma.$transaction([
    prisma.pot.update({
      where: { id: pot.id },
      data: { amountCents: { increment: amountCents } },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { unallocatedCents: { decrement: fromUnallocated } },
    }),
    prisma.transaction.create({
      data: {
        potId: pot.id,
        userId: user.id,
        type: "DEPOSIT",
        amountCents,
        description: description || "Geld gestort",
        date: new Date(`${date}T12:00:00`),
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
