import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Ongeldige invoer.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { name, email, password, invite: inviteCode } = parsed.data;
  const code = inviteCode.toUpperCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Er bestaat al een account met dit e-mailadres." },
      { status: 409 }
    );
  }

  const invite = await prisma.inviteCode.findUnique({ where: { code } });
  if (!invite) {
    return NextResponse.json(
      { error: "Deze uitnodigingscode is niet geldig." },
      { status: 400 }
    );
  }

  if (invite.revokedAt !== null) {
    return NextResponse.json(
      { error: "Deze uitnodiging is ingetrokken." },
      { status: 400 }
    );
  }

  if (invite.expiresAt !== null && invite.expiresAt <= new Date()) {
    return NextResponse.json(
      { error: "Deze uitnodiging is verlopen." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const createdUser = await prisma.$transaction(async (tx) => {
      // Atomically consume one use of the invite.
      const updated = await tx.inviteCode.updateMany({
        where: {
          id: invite.id,
          revokedAt: null,
          uses: { lt: invite.maxUses },
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        data: { uses: { increment: 1 } },
      });

      if (updated.count === 0) {
        return null;
      }

      return tx.user.create({
        data: {
          email,
          name,
          role: invite.role,
          passwordHash,
        },
      });
    });

    if (!createdUser) {
      return NextResponse.json(
        { error: "Deze uitnodiging is niet (meer) geldig." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "Account aangemaakt." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registratie mislukt:", error);
    return NextResponse.json(
      { error: "Er ging iets mis bij het aanmaken van je account." },
      { status: 500 }
    );
  }
}
