"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Onjuiste e-mail of wachtwoord, of dit account is uitgeschakeld.");
      } else {
        router.push(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/");
        router.refresh();
      }
    } catch {
      setError("Er ging iets mis bij het inloggen. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[22px] border border-border p-8 md:p-10">
      <span className="eyebrow">WELKOM TERUG</span>
      <h1 className="text-3xl">Inloggen</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Log in om je financiën te beheren.
      </p>

      <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-2">
        <Label htmlFor="login-email">E-mailadres</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="jij@voorbeeld.nl"
          autoComplete="email"
          required
        />

        <Label htmlFor="login-password" className="mt-3">
          Wachtwoord
        </Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="mt-6 w-full">
          <LogIn />
          {loading ? "Even geduld…" : "Inloggen"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Nog geen account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Registreer met een uitnodigingscode
        </Link>
      </p>
    </div>
  );
}
