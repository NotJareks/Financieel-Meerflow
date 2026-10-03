import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guards";
import { potWithdrawSchema } from "@/lib/validation";

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

  const parsed = potWithdrawSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." },
      { status: 400 }
    );
  }

  const { amountCents, description, date } = parsed.data;

  const pot = await prisma.pot.findFirst({ where: { id, userId: user.id } });
  if (!pot) {
    return NextResponse.json({ error: "Spaarpot niet gevonden." }, { status: 404 });
  }

  if (amountCents > pot.amountCents) {
    return NextResponse.json(
      { error: "Je kunt niet meer opnemen dan er in deze spaarpot staat." },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.pot.update({
      where: { id: pot.id },
      data: { amountCents: { decrement: amountCents } },
    }),
    prisma.transaction.create({
      data: {
        potId: pot.id,
        userId: user.id,
        type: "WITHDRAWAL",
        amountCents,
        description: description || "Geld opgenomen",
        date: new Date(`${date}T12:00:00`),
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
