"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoneyInput } from "@/components/money-input";
import { eurosToCents } from "@/lib/money";
import { apiFetch } from "@/lib/client-fetch";

export function CreatePotDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goalEnabled, setGoalEnabled] = useState(false);
  const [goalAmount, setGoalAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setName("");
    setDescription("");
    setGoalEnabled(false);
    setGoalAmount("");
    setError(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const goalAmountCents = goalEnabled ? eurosToCents(goalAmount) : 0;
    if (goalEnabled && goalAmountCents <= 0) {
      setError("Vul een geldig doelbedrag in.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/pots", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: description || null,
          goalEnabled,
          goalAmountCents,
        }),
      });
      reset();
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
          <Plus />
          Nieuwe spaarpot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <span className="eyebrow">NIEUWE SPAARPOT</span>
          <DialogTitle>Nieuwe spaarpot</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-2">
          <Label htmlFor="pot-name">Naam</Label>
          <Input
            id="pot-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Bijvoorbeeld Vakantie"
            required
            maxLength={80}
          />

          <Label htmlFor="pot-description" className="mt-2">
            Omschrijving
          </Label>
          <Textarea
            id="pot-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Waarvoor spaar je?"
            rows={3}
            maxLength={500}
          />

          <div className="mt-3 flex items-center justify-between gap-5 rounded-xl border border-border bg-white/[0.025] p-4">
            <span className="flex flex-col gap-1">
              <strong className="text-[0.82rem] font-medium">
                Spaardoel instellen
              </strong>
              <small className="text-[0.68rem] text-muted-foreground">
                Stel een concreet doelbedrag in.
              </small>
            </span>
            <Switch checked={goalEnabled} onCheckedChange={setGoalEnabled} />
          </div>

          {goalEnabled && (
            <div className="mt-2">
              <Label htmlFor="pot-goal">Doelbedrag</Label>
              <MoneyInput
                id="pot-goal"
                value={goalAmount}
                onChange={setGoalAmount}
                placeholder="0,00"
                className="mt-1"
              />
            </div>
          )}

          {error && (
            <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-5 w-full">
            {loading ? "Even geduld…" : "Spaarpot aanmaken"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
