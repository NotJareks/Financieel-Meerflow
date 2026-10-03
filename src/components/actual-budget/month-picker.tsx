"use client";

import { useRouter } from "next/navigation";

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();

  return (
    <input
      type="month"
      value={month}
      onChange={(event) => {
        const value = event.target.value;
        if (value) {
          router.push(`/actual-budget?month=${value}`);
        }
      }}
      className="w-full min-w-[190px] rounded-[10px] border border-border bg-surface-light px-4 py-[13px] text-sm text-foreground outline-none transition-colors focus:border-accent/40 [color-scheme:dark] sm:w-auto"
    />
  );
}
