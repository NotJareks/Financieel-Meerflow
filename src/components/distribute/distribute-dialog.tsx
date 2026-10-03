"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { apiFetch } from "@/lib/client-fetch";

export type DistributionPot = {
  id: string;
  name: string;
  amountCents: number;
};

export function DistributeDialog({
  pots,
  unallocatedCents,
}: {
  pots: DistributionPot[];
  unallocatedCents: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [total, setTotal] = useState("");
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalCents = eurosToCents(total);
  const assignedCents = useMemo(
    () =>
      pots.reduce(
        (sum, pot) => sum + eurosToCents(allocations[pot.id] ?? ""),
        0
      ),
    [pots, allocations]
  );
  const availableCents = unallocatedCents + totalCents;
  const remainingCents = Math.max(0, availableCents - assignedCents);

  function setAllocation(potId: string, value: string) {
    setAllocations((prev) => ({ ...prev, [potId]: value }));
  }

  function reset() {
    setTotal("");
    setAllocations({});
    setError(null);
  }

  async function onSubmit() {
    setError(null);

    if (totalCents <= 0) {
      setError("Vul eerst een bedrag in.");
      return;
    }
    if (assignedCents <= 0) {
      setError("Verdeel minimaal een bedrag over een spaarpot.");
      return;
    }
    if (assignedCents > availableCents) {
      setError("Je probeert meer te verdelen dan beschikbaar is.");
      return;
    }

    const payload = {
      totalCents,
      allocations: pots
        .map((pot) => ({
          potId: pot.id,
          amountCents: eurosToCents(allocations[pot.id] ?? ""),
        }))
        .filter((allocation) => allocation.amountCents > 0),
    };

    setLoading(true);
    try {
      await apiFetch("/api/distribute", {
        method: "POST",
        body: JSON.stringify(payload),
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
        <Button variant="secondary">
          <Landmark />
          Geld verdelen
        </Button>
      </DialogTrigger>
      <DialogContent wide>
        <DialogHeader>
          <span className="eyebrow">GELD VERDELEN</span>
          <DialogTitle>Verdeel je geld</DialogTitle>
          <p className="pt-1 text-sm text-muted-foreground">
            Verdeel een nieuw bedrag over één of meerdere spaarpotten.
          </p>
        </DialogHeader>

        <div className="mt-5">
          <Label htmlFor="distribute-total">Totaalbedrag</Label>
          <MoneyInput
            id="distribute-total"
            value={total}
            onChange={setTotal}
            className="mt-1"
          />

          <div className="my-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-[11px] bg-white/[0.03] px-4 py-3">
              <span className="block text-[0.65rem] text-muted-foreground">
                Beschikbaar
              </span>
              <strong className="text-sm text-accent-light">
                {formatCents(availableCents)}
              </strong>
            </div>
            <div className="rounded-[11px] bg-white/[0.03] px-4 py-3">
              <span className="block text-[0.65rem] text-muted-foreground">
                Toegewezen
              </span>
              <strong className="text-sm text-accent-light">
                {formatCents(assignedCents)}
              </strong>
            </div>
            <div className="rounded-[11px] bg-white/[0.03] px-4 py-3">
              <span className="block text-[0.65rem] text-muted-foreground">
                Over
              </span>
              <strong className="text-sm text-accent-light">
                {formatCents(remainingCents)}
              </strong>
            </div>
          </div>

          {pots.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/[0.12] px-4 py-8 text-center text-sm text-muted-foreground">
              Maak eerst een spaarpot aan voordat je geld kunt verdelen.
            </p>
          ) : (
            <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto">
              {pots.map((pot) => (
                <div
                  key={pot.id}
                  className="grid grid-cols-1 items-center gap-4 rounded-[11px] border border-border p-3 sm:grid-cols-[1fr_160px]"
                >
                  <div className="flex flex-col gap-1">
                    <strong className="text-[0.8rem] font-medium">
                      {pot.name}
                    </strong>
                    <span className="text-[0.65rem] text-muted-foreground">
                      Huidig: {formatCents(pot.amountCents)}
                    </span>
                  </div>
                  <MoneyInput
                    value={allocations[pot.id] ?? ""}
                    onChange={(value) => setAllocation(pot.id, value)}
                    placeholder="0,00"
                  />
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button
            onClick={onSubmit}
            disabled={loading || pots.length === 0}
            className="mt-5 w-full"
          >
            {loading ? "Even geduld…" : "Geld verdelen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
