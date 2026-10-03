"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoneyInput } from "@/components/money-input";
import { centsToInputValue, eurosToCents } from "@/lib/money";
import { apiFetch } from "@/lib/client-fetch";

export function SavingGoalInput({
  savingGoalCents,
}: {
  savingGoalCents: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(centsToInputValue(savingGoalCents));
  const [saving, setSaving] = useState(false);

  // Keep in sync after router.refresh() re-renders the server tree.
  useEffect(() => {
    setValue(centsToInputValue(savingGoalCents));
  }, [savingGoalCents]);

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      await apiFetch("/api/budget/saving-goal", {
        method: "PUT",
        body: JSON.stringify({ monthlySavingGoalCents: eurosToCents(value) }),
      });
      router.refresh();
    } catch {
      // silent — the value simply won't persist
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full min-w-[180px] md:w-auto">
      <MoneyInput
        value={value}
        onChange={setValue}
        onBlur={save}
        placeholder="0,00"
        aria-label="Maandelijks spaardoel"
      />
      {saving && (
        <p className="mt-1 text-[0.7rem] text-muted-foreground">Opslaan…</p>
      )}
    </div>
  );
}
