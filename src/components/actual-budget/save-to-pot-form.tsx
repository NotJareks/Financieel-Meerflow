"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoneyInput } from "@/components/money-input";
import { eurosToCents, formatCents } from "@/lib/money";
import { apiFetch } from "@/lib/client-fetch";

export type SavePotOption = {
  id: string;
  name: string;
};

export function SaveToPotForm({
  month,
  pots,
  availableCents,
  savedCents,
}: {
  month: string;
  pots: SavePotOption[];
  availableCents: number;
  savedCents: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [potId, setPotId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const amountCents = eurosToCents(amount);
    if (amountCents <= 0) {
      setError("Vul een geldig bedrag in.");
      return;
    }
    if (amountCents > availableCents) {
      setError(
        `Je kunt maximaal ${formatCents(availableCents)} opzijzetten voor deze maand.`
      );
      return;
    }
    if (!potId) {
      setError("Kies eerst een spaarpot.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch("/api/actual-budget/save", {
        method: "POST",
        body: JSON.stringify({ month, potId, amountCents }),
      });
      setAmount("");
      setSuccess(
        `${formatCents(amountCents)} is toegevoegd aan de gekozen spaarpot.`
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_0.7fr]">
      <div>
        <p className="max-w-[650px] text-sm leading-relaxed text-muted-foreground">
          Heb je deze maand minder uitgegeven dan verwacht? Dan kun je een deel
          van het overgebleven bedrag reserveren voor een bestaande spaarpot.
        </p>
        <div className="mt-4 inline-flex flex-col gap-1 rounded-[13px] border border-accent/15 bg-accent/10 px-6 py-5">
          <span className="text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
            Beschikbaar om opzij te zetten
          </span>
          <strong className="font-serif text-2xl text-accent-light">
            {formatCents(availableCents)}
          </strong>
          {savedCents > 0 && (
            <span className="text-[0.7rem] text-muted-foreground">
              Al opzijgezet: {formatCents(savedCents)}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <Label htmlFor="save-amount" className="mt-2">
          Bedrag
        </Label>
        <MoneyInput id="save-amount" value={amount} onChange={setAmount} />

        <Label htmlFor="save-pot" className="mt-2">
          Naar spaarpot
        </Label>
        <Select value={potId} onValueChange={setPotId}>
          <SelectTrigger id="save-pot">
            <SelectValue placeholder="Kies een spaarpot" />
          </SelectTrigger>
          <SelectContent>
            {pots.map((pot) => (
              <SelectItem key={pot.id} value={pot.id}>
                {pot.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {error && (
          <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            {success}
          </p>
        )}

        <Button type="submit" disabled={loading} className="mt-4 w-full">
          <PiggyBank />
          {loading ? "Even geduld…" : "Bedrag opzijzetten"}
        </Button>
      </form>
    </div>
  );
}
