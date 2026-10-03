import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guards";
import { incomeCreateSchema } from "@/lib/validation";

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

  const parsed = incomeCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." },
      { status: 400 }
    );
  }

  const income = await prisma.budgetIncome.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      amountCents: parsed.data.amountCents,
      frequency: parsed.data.frequency,
    },
  });

  return NextResponse.json({ income }, { status: 201 });
}
