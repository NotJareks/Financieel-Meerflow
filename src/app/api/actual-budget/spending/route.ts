import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guards";
import { actualSpendingSchema } from "@/lib/validation";

export async function PUT(request: Request) {
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

  const parsed = actualSpendingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." },
      { status: 400 }
    );
  }

  const { month, category, amountCents } = parsed.data;

  const monthRecord = await prisma.actualBudgetMonth.upsert({
    where: { userId_month: { userId: user.id, month } },
    create: { userId: user.id, month },
    update: {},
  });

  const spending = await prisma.actualBudgetSpending.upsert({
    where: {
      actualBudgetMonthId_category: {
        actualBudgetMonthId: monthRecord.id,
        category,
      },
    },
    create: {
      actualBudgetMonthId: monthRecord.id,
      category,
      amountCents,
    },
    update: { amountCents },
  });

  return NextResponse.json({ spending });
}
