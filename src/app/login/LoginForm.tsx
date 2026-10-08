"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

/**
 * Login só com senha: o painel usa um usuário compartilhado do Supabase Auth
 * (o RLS do banco só libera leitura para usuários autenticados). O e-mail não é
 * segredo — a proteção é a senha. Pode ser trocado pela env var abaixo.
 */
const SHARED_LOGIN_EMAIL =
  process.env.NEXT_PUBLIC_DASHBOARD_LOGIN_EMAIL ?? "painel@axisfunnel.app";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: SHARED_LOGIN_EMAIL,
      password,
    });

    if (error) {
      setError("Senha inválida.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campo oculto para gerenciadores de senha associarem a senha a este painel */}
      <input type="hidden" name="username" autoComplete="username" value={SHARED_LOGIN_EMAIL} readOnly />
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      {error && (
        <p className="text-sm text-status-critical" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Entrar
      </Button>
    </form>
  );
}
