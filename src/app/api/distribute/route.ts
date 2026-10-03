import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guards";
import { distributeSchema } from "@/lib/validation";
import { getTodayISO } from "@/lib/dates";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const parsed = distributeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." },
      { status: 400 }
    );
  }

  const { totalCents, allocations } = parsed.data;

  const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!currentUser) {
    return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });
  }

  const assignedCents = allocations.reduce((sum, item) => sum + item.amountCents, 0);

  if (assignedCents > currentUser.unallocatedCents + totalCents) {
    return NextResponse.json(
      { error: "Je probeert meer te verdelen dan beschikbaar is." },
      { status: 400 }
    );
  }

  const potIds = allocations.map((item) => item.potId);
  const pots = await prisma.pot.findMany({
    where: { id: { in: potIds }, userId: user.id },
  });
  const potsById = new Map(pots.map((pot) => [pot.id, pot]));

  for (const allocation of allocations) {
    if (!potsById.has(allocation.potId)) {
      return NextResponse.json(
        { error: "Een van de gekozen spaarpotten bestaat niet." },
        { status: 400 }
      );
    }
  }

  // Existing unallocated money is used first.
  const usedExisting = Math.min(currentUser.unallocatedCents, assignedCents);
  const usedNew = assignedCents - usedExisting;
  const newUnallocatedCents =
    currentUser.unallocatedCents -
    usedExisting +
    Math.max(0, totalCents - usedNew);

  const today = new Date(`${getTodayISO()}T12:00:00`);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { unallocatedCents: newUnallocatedCents },
    }),
    ...allocations.map((allocation) =>
      prisma.pot.update({
        where: { id: allocation.potId },
        data: { amountCents: { increment: allocation.amountCents } },
      })
    ),
    ...allocations.map((allocation) =>
      prisma.transaction.create({
        data: {
          potId: allocation.potId,
          userId: user.id,
          type: "DEPOSIT",
          amountCents: allocation.amountCents,
          description: "Geld verdeeld",
          date: today,
        },
      })
    ),
  ]);

  return NextResponse.json({ ok: true, unallocatedCents: newUnallocatedCents });
}
