import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guards";
import { savingGoalSchema } from "@/lib/validation";

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

  const parsed = savingGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." },
      { status: 400 }
    );
  }

  const settings = await prisma.budgetSettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      monthlySavingGoalCents: parsed.data.monthlySavingGoalCents,
    },
    update: {
      monthlySavingGoalCents: parsed.data.monthlySavingGoalCents,
    },
  });

  return NextResponse.json({ settings });
}
