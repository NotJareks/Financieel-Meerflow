"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, ShieldMinus, ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/client-fetch";

export function UserActions({
  userId,
  role,
  disabled,
  isSelf,
}: {
  userId: string;
  role: "ADMIN" | "USER";
  disabled: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleDisabled() {
    setLoading("toggle");
    try {
      await apiFetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "toggle-disabled" }),
      });
      router.refresh();
    } catch {
      // ignore
    } finally {
      setLoading(null);
    }
  }

  async function setRole(newRole: "ADMIN" | "USER") {
    setLoading("role");
    try {
      await apiFetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "set-role", role: newRole }),
      });
      router.refresh();
    } catch {
      // ignore
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {role === "ADMIN" ? (
        <Button
          variant="secondary"
          size="sm"
          disabled={isSelf || loading !== null}
          onClick={() => setRole("USER")}
          title={isSelf ? "Je kunt jezelf niet degraderen" : "Degradeer naar gebruiker"}
        >
          <ShieldMinus />
          Degradeer
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          disabled={loading !== null}
          onClick={() => setRole("ADMIN")}
          title="Promoveer naar beheerder"
        >
          <ShieldPlus />
          Promoveer
        </Button>
      )}

      <Button
        variant={disabled ? "secondary" : "destructive"}
        size="sm"
        disabled={isSelf || loading !== null}
        onClick={toggleDisabled}
        title={isSelf ? "Je kunt jezelf niet uitschakelen" : undefined}
      >
        {disabled ? <CheckCircle2 /> : <Ban />}
        {loading === "toggle" ? "…" : disabled ? "Inschakelen" : "Uitschakelen"}
      </Button>
    </div>
  );
}
