import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guards";
import { potCreateSchema } from "@/lib/validation";

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

  const parsed = potCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." },
      { status: 400 }
    );
  }

  const { name, description, goalEnabled, goalAmountCents } = parsed.data;

  if (goalEnabled && (!goalAmountCents || goalAmountCents <= 0)) {
    return NextResponse.json(
      { error: "Vul een geldig doelbedrag in." },
      { status: 400 }
    );
  }

  const pot = await prisma.pot.create({
    data: {
      userId: user.id,
      name,
      description: description || null,
      goalEnabled,
      goalAmountCents: goalEnabled ? goalAmountCents : null,
    },
  });

  return NextResponse.json({ pot }, { status: 201 });
}
