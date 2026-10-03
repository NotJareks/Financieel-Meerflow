"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoneyInput } from "@/components/money-input";
import { eurosToCents, formatCents } from "@/lib/money";
import { getTodayISO } from "@/lib/dates";
import { apiFetch } from "@/lib/client-fetch";

export function WithdrawDialog({
  potId,
  availableCents,
}: {
  potId: string;
  availableCents: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTodayISO());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const amountCents = eurosToCents(amount);
    if (amountCents <= 0) {
      setError("Vul een geldig bedrag in.");
      return;
    }
    if (amountCents > availableCents) {
      setError("Je kunt niet meer opnemen dan er in deze spaarpot staat.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch(`/api/pots/${potId}/withdraw`, {
        method: "POST",
        body: JSON.stringify({
          amountCents,
          description: description || null,
          date,
        }),
      });
      setAmount("");
      setDescription("");
      setDate(getTodayISO());
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <ArrowDownCircle />
          Geld opnemen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <span className="eyebrow">TRANSACTIE</span>
          <DialogTitle>Geld opnemen</DialogTitle>
        </DialogHeader>

        <div className="mt-4 rounded-[10px] bg-accent/10 px-4 py-3 text-sm text-muted-foreground">
          Beschikbaar:
          <strong className="ml-1.5 text-accent-light">
            {formatCents(availableCents)}
          </strong>
        </div>

        <form onSubmit={onSubmit} className="mt-2 flex flex-col gap-2">
          <Label htmlFor="withdraw-amount">Bedrag</Label>
          <MoneyInput
            id="withdraw-amount"
            value={amount}
            onChange={setAmount}
            autoFocus
          />

          <Label htmlFor="withdraw-description" className="mt-2">
            Omschrijving
          </Label>
          <Input
            id="withdraw-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Bijvoorbeeld Aankoop"
            maxLength={200}
          />

          <Label htmlFor="withdraw-date" className="mt-2">
            Datum
          </Label>
          <Input
            id="withdraw-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />

          {error && (
            <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-5 w-full">
            {loading ? "Even geduld…" : "Geld opnemen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
