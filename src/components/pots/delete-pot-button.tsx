"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCents } from "@/lib/money";
import { apiFetch } from "@/lib/client-fetch";

export function DeletePotButton({
  potId,
  potName,
  amountCents,
}: {
  potId: string;
  potName: string;
  amountCents: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    setError(null);
    setLoading(true);
    try {
      await apiFetch(`/api/pots/${potId}`, { method: "DELETE" });
      setOpen(false);
      router.push("/");
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
        <Button variant="destructive">
          <Trash2 />
          Spaarpot verwijderen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <span className="eyebrow">VERWIJDEREN</span>
          <DialogTitle>Spaarpot verwijderen</DialogTitle>
          <DialogDescription className="pt-2">
            Weet je zeker dat je de spaarpot &quot;{potName}&quot; wilt
            verwijderen?
            {amountCents > 0 && (
              <>
                <br />
                <br />
                <strong className="text-danger">
                  Let op: {formatCents(amountCents)} in deze spaarpot wordt
                  verwijderd uit je totaal en wordt niet toegevoegd aan
                  &quot;Niet verdeeld&quot;.
                </strong>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Annuleren
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={loading}>
            {loading ? "Even geduld…" : "Definitief verwijderen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
