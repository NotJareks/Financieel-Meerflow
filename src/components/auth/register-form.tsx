"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/client-fetch";

export function RegisterForm({ initialInvite }: { initialInvite?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invite, setInvite] = useState(initialInvite ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens bevatten.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, invite }),
      });

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Account is aangemaakt, maar automatisch inloggen lukte niet. Log hiernaast in."
        );
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[22px] border border-border p-8 md:p-10">
      <span className="eyebrow">UITNODIGING</span>
      <h1 className="text-3xl">Account aanmaken</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Registreer met een geldige uitnodigingscode.
      </p>

      <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-2">
        <Label htmlFor="register-name">Naam</Label>
        <Input
          id="register-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Je naam"
          autoComplete="name"
          required
          maxLength={100}
        />

        <Label htmlFor="register-email" className="mt-3">
          E-mailadres
        </Label>
        <Input
          id="register-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="jij@voorbeeld.nl"
          autoComplete="email"
          required
        />

        <Label htmlFor="register-password" className="mt-3">
          Wachtwoord
        </Label>
        <Input
          id="register-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimaal 8 tekens"
          autoComplete="new-password"
          required
          minLength={8}
        />

        <Label htmlFor="register-invite" className="mt-3">
          Uitnodigingscode
        </Label>
        <Input
          id="register-invite"
          value={invite}
          onChange={(event) => setInvite(event.target.value.toUpperCase())}
          placeholder="Bijvoorbeeld AB12-CD34-EF56"
          required
          maxLength={64}
        />

        {error && (
          <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="mt-6 w-full">
          <UserPlus />
          {loading ? "Even geduld…" : "Account aanmaken"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Heb je al een account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Inloggen
        </Link>
      </p>
    </div>
  );
}
