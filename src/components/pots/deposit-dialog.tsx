"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpCircle } from "lucide-react";
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
import { eurosToCents } from "@/lib/money";
import { getTodayISO } from "@/lib/dates";
import { apiFetch } from "@/lib/client-fetch";

export function DepositDialog({ potId }: { potId: string }) {
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

    setLoading(true);
    try {
      await apiFetch(`/api/pots/${potId}/deposit`, {
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
        <Button>
          <ArrowUpCircle />
          Geld storten
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <span className="eyebrow">TRANSACTIE</span>
          <DialogTitle>Geld storten</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-2">
          <Label htmlFor="deposit-amount">Bedrag</Label>
          <MoneyInput
            id="deposit-amount"
            value={amount}
            onChange={setAmount}
            autoFocus
          />

          <Label htmlFor="deposit-description" className="mt-2">
            Omschrijving
          </Label>
          <Input
            id="deposit-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Bijvoorbeeld Salaris"
            maxLength={200}
          />

          <Label htmlFor="deposit-date" className="mt-2">
            Datum
          </Label>
          <Input
            id="deposit-date"
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
            {loading ? "Even geduld…" : "Geld storten"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
