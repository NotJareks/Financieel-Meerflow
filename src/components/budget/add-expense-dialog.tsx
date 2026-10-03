"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoneyInput } from "@/components/money-input";
import { STANDARD_CATEGORIES } from "@/lib/budget";
import { eurosToCents } from "@/lib/money";
import { apiFetch } from "@/lib/client-fetch";

const FREQUENCIES = [
  { value: "MONTHLY", label: "Maandelijks" },
  { value: "QUARTERLY", label: "Per kwartaal" },
  { value: "YEARLY", label: "Jaarlijks" },
];

export function AddExpenseDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(STANDARD_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<string>("MONTHLY");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const amountCents = eurosToCents(amount);
    if (!name.trim() || amountCents <= 0) {
      setError("Vul een omschrijving en een geldig bedrag in.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/budget/expenses", {
        method: "POST",
        body: JSON.stringify({ name, category, amountCents, frequency }),
      });
      setName("");
      setCategory(STANDARD_CATEGORIES[0]);
      setAmount("");
      setFrequency("MONTHLY");
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
          <Plus />
          Vaste last
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <span className="eyebrow">MAANDBUDGET</span>
          <DialogTitle>Vaste last toevoegen</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-2">
          <Label htmlFor="expense-name">Omschrijving</Label>
          <Input
            id="expense-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Bijvoorbeeld Zorgverzekering"
            required
            maxLength={100}
          />

          <Label className="mt-2">Categorie</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STANDARD_CATEGORIES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label htmlFor="expense-amount" className="mt-2">
            Bedrag
          </Label>
          <MoneyInput
            id="expense-amount"
            value={amount}
            onChange={setAmount}
            autoFocus
          />

          <Label className="mt-2">Frequentie</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && (
            <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-5 w-full">
            {loading ? "Even geduld…" : "Vaste last toevoegen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
