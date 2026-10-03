"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoneyInput } from "@/components/money-input";
import { centsToInputValue, eurosToCents, formatCents } from "@/lib/money";
import { apiFetch } from "@/lib/client-fetch";
import { cn } from "@/lib/utils";

export type ActualCategoryRow = {
  category: string;
  budgetedCents: number;
  actualCents: number;
};

export function SpendingEditor({
  month,
  rows,
}: {
  month: string;
  rows: ActualCategoryRow[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const row of rows) {
      initial[row.category] =
        row.actualCents > 0 ? centsToInputValue(row.actualCents) : "";
    }
    return initial;
  });
  const [saving, setSaving] = useState<string | null>(null);

  async function saveCategory(category: string, rawValue: string) {
    if (saving === category) return;
    setSaving(category);
    try {
      await apiFetch("/api/actual-budget/spending", {
        method: "PUT",
        body: JSON.stringify({
          month,
          category,
          amountCents: eurosToCents(rawValue),
        }),
      });
      router.refresh();
    } catch {
      // keep the current view, server will show the truth on next refresh
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row) => {
        const difference = row.budgetedCents - row.actualCents;
        const percentage =
          row.budgetedCents > 0
            ? Math.min(100, Math.round((row.actualCents / row.budgetedCents) * 100))
            : 0;

        return (
          <div
            key={row.category}
            className="rounded-[14px] border border-border bg-white/[0.018] p-5"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px] lg:items-center">
              <div>
                <strong className="mb-1.5 block text-[0.9rem] font-medium">
                  {row.category}
                </strong>
                <span className="text-[0.72rem] text-muted-foreground">
                  Begroot: {formatCents(row.budgetedCents)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <label className="shrink-0 text-[0.7rem] text-muted-foreground">
                  Werkelijk
                </label>
                <MoneyInput
                  value={values[row.category] ?? ""}
                  onChange={(value) =>
                    setValues((prev) => ({ ...prev, [row.category]: value }))
                  }
                  onBlur={() => saveCategory(row.category, values[row.category] ?? "")}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 items-center gap-5 sm:grid-cols-[1fr_auto]">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${percentage}%` }} />
              </div>
              <div
                className={cn(
                  "text-right text-[0.72rem] sm:min-w-[160px]",
                  difference > 0 && "text-success",
                  difference < 0 && "text-danger",
                  difference === 0 && "text-muted-foreground"
                )}
              >
                {difference > 0
                  ? `${formatCents(difference)} over`
                  : difference < 0
                    ? `${formatCents(Math.abs(difference))} boven budget`
                    : "Binnen budget"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
