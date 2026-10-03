"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/client-fetch";

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 12; i++) {
    code += alphabet[bytes[i] % alphabet.length];
    if (i === 3 || i === 7) code += "-";
  }
  return code;
}

export function CreateInviteForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [role, setRole] = useState<string>("USER");
  const [maxUses, setMaxUses] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const maxUsesNumber = Number.parseInt(maxUses, 10);
    if (!Number.isFinite(maxUsesNumber) || maxUsesNumber < 1) {
      setError("Maximaal aantal gebruiken moet minimaal 1 zijn.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch("/api/admin/invites", {
        method: "POST",
        body: JSON.stringify({
          code: code || null,
          role,
          maxUses: maxUsesNumber,
          expiresAt: expiresAt || null,
          note: note || null,
        }),
      });
      setCode("");
      setMaxUses("1");
      setExpiresAt("");
      setNote("");
      setSuccess(`Uitnodiging aangemaakt: ${data.invite.code}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 rounded-[18px] border border-border bg-white/[0.018] p-6"
    >
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-accent" />
        <h2 className="text-xl">Nieuwe uitnodiging</h2>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="invite-code">
            Code <span className="text-muted-foreground/60">(optioneel)</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="invite-code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="Leeg = automatisch"
              maxLength={64}
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="shrink-0"
              onClick={() => setCode(generateCode())}
              title="Genereer code"
            >
              <RefreshCcw />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Rol voor nieuwe gebruiker</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">Gebruiker</SelectItem>
              <SelectItem value="ADMIN">Beheerder</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="invite-max-uses">Maximaal aantal gebruiken</Label>
          <Input
            id="invite-max-uses"
            type="number"
            min={1}
            max={1000}
            value={maxUses}
            onChange={(event) => setMaxUses(event.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="invite-expires">
            Verloopt op <span className="text-muted-foreground/60">(optioneel)</span>
          </Label>
          <Input
            id="invite-expires"
            type="datetime-local"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label htmlFor="invite-note">
          Notitie / label{" "}
          <span className="text-muted-foreground/60">(optioneel)</span>
        </Label>
        <Input
          id="invite-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Bijvoorbeeld: voor Marie"
          maxLength={200}
        />
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {success}
        </p>
      )}

      <Button type="submit" disabled={loading} className="mt-4 md:self-start">
        <KeyRound />
        {loading ? "Even geduld…" : "Uitnodiging aanmaken"}
      </Button>
    </form>
  );
}
