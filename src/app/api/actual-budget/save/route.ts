import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guards";
import { actualSaveSchema } from "@/lib/validation";
import { toMonthlyCents } from "@/lib/budget";
import { formatMonth } from "@/lib/dates";

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

  const parsed = actualSaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." },
      { status: 400 }
    );
  }

  const { month, potId, amountCents } = parsed.data;

  const [pot, monthRecord, expenses] = await Promise.all([
    prisma.pot.findFirst({ where: { id: potId, userId: user.id } }),
    prisma.actualBudgetMonth.findUnique({
      where: { userId_month: { userId: user.id, month } },
      include: { spending: true },
    }),
    prisma.budgetExpense.findMany({ where: { userId: user.id } }),
  ]);

  if (!pot) {
    return NextResponse.json(
      { error: "Kies eerst een spaarpot." },
      { status: 400 }
    );
  }

  const budgetedTotal = expenses.reduce(
    (sum, expense) => sum + toMonthlyCents(expense.amountCents, expense.frequency),
    0
  );
  const spendingRows = monthRecord?.spending ?? [];
  const spentTotal = spendingRows.reduce((sum, row) => sum + row.amountCents, 0);
  const remaining = budgetedTotal - spentTotal;
  const savedCents = monthRecord?.savedCents ?? 0;
  const availableToSave = Math.max(0, remaining - savedCents);

  if (amountCents > availableToSave) {
    return NextResponse.json(
      {
        error: `Je kunt maximaal ${new Intl.NumberFormat("nl-NL", {
          style: "currency",
          currency: "EUR",
        }).format(availableToSave / 100)} opzijzetten voor deze maand.`,
      },
      { status: 400 }
    );
  }

  const description = `Overgehouden ${formatMonth(month)}`;
  const date = new Date(`${month}-28T12:00:00`);

  await prisma.$transaction([
    prisma.pot.update({
      where: { id: pot.id },
      data: { amountCents: { increment: amountCents } },
    }),
    prisma.transaction.create({
      data: {
        potId: pot.id,
        userId: user.id,
        type: "DEPOSIT",
        amountCents,
        description,
        date,
      },
    }),
    prisma.actualBudgetMonth.upsert({
      where: { userId_month: { userId: user.id, month } },
      create: {
        userId: user.id,
        month,
        savedCents: amountCents,
        savedPotId: pot.id,
      },
      update: {
        savedCents: { increment: amountCents },
        savedPotId: pot.id,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
