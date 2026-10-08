import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./LoginForm";
import { Activity } from "lucide-react";

export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{
        backgroundImage:
          "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--primary) 14%, transparent), transparent)",
      }}
    >
      <Card className="w-full max-w-sm border-border/60 shadow-xl shadow-primary/5">
        <CardHeader className="items-center text-center">
          <div className="mb-1 flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
            <Activity className="size-5" />
          </div>
          <CardTitle className="text-xl tracking-tight">Painel de Saúde de BMs</CardTitle>
          <CardDescription>
            Acesso interno — digite a senha do painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
