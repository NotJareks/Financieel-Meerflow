import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guards";
import { inviteCreateSchema } from "@/lib/validation";

function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(12);
  let code = "";
  for (let i = 0; i < 12; i++) {
    code += alphabet[bytes[i] % alphabet.length];
    if (i === 3 || i === 7) code += "-";
  }
  return code;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const parsed = inviteCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." },
      { status: 400 }
    );
  }

  let code = (parsed.data.code ?? "").trim().toUpperCase();
  if (!code) {
    code = generateCode();
  }

  const existing = await prisma.inviteCode.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json(
      { error: "Deze code bestaat al. Kies een andere of laat het veld leeg." },
      { status: 409 }
    );
  }

  let expiresAt: Date | null = null;
  if (parsed.data.expiresAt) {
    const parsedDate = new Date(parsed.data.expiresAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Vul een geldige verloopdatum in." },
        { status: 400 }
      );
    }
    expiresAt = parsedDate;
  }

  const invite = await prisma.inviteCode.create({
    data: {
      code,
      role: parsed.data.role,
      maxUses: parsed.data.maxUses,
      expiresAt,
      note: parsed.data.note || null,
      createdById: user.id,
    },
  });

  return NextResponse.json({ invite }, { status: 201 });
}
