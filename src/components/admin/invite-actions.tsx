"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/client-fetch";

export function CopyInviteButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const inviteUrl = `${window.location.origin}/register?invite=${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback for older browsers
      window.prompt("Kopieer de uitnodigingslink:", inviteUrl);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={copy} title="Link kopiëren">
      {copied ? <Check className="text-success" /> : <Copy />}
      {copied ? "Gekopieerd" : "Kopiëren"}
    </Button>
  );
}

export function RevokeInviteButton({
  inviteId,
  alreadyRevoked,
}: {
  inviteId: string;
  alreadyRevoked: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function revoke() {
    if (loading) return;
    setLoading(true);
    try {
      await apiFetch(`/api/admin/invites/${inviteId}`, { method: "DELETE" });
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  if (alreadyRevoked) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Ban className="h-3.5 w-3.5" />
        Ingetrokken
      </span>
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={revoke}
      disabled={loading}
      title="Uitnodiging intrekken"
    >
      <Ban />
      {loading ? "…" : "Intrekken"}
    </Button>
  );
}
