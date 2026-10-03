import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guards";
import { userUpdateSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." },
      { status: 400 }
    );
  }

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) {
    return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });
  }

  if (id === currentUser.id) {
    return NextResponse.json(
      { error: "Je kunt je eigen account niet aanpassen." },
      { status: 400 }
    );
  }

  if (parsed.data.action === "toggle-disabled") {
    const updated = await prisma.user.update({
      where: { id },
      data: { disabled: !targetUser.disabled },
      select: { id: true, disabled: true },
    });
    return NextResponse.json({ user: updated });
  }

  if (parsed.data.action === "set-role" && parsed.data.role) {
    const updated = await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role },
      select: { id: true, role: true },
    });
    return NextResponse.json({ user: updated });
  }

  return NextResponse.json({ error: "Ongeldige actie." }, { status: 400 });
}
