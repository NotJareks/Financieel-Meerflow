"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/client-fetch";

export function DeleteItemButton({
  url,
  title = "Verwijderen",
}: {
  url: string;
  title?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (loading) return;
    setLoading(true);
    try {
      await apiFetch(url, { method: "DELETE" });
      router.refresh();
    } catch {
      // keep the item on screen; the user can retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onDelete}
      disabled={loading}
      className="grid h-[30px] w-[30px] place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-danger/30 hover:text-danger disabled:opacity-50"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
