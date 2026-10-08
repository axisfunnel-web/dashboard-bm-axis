"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/LogoutButton";
import { Activity, Loader2, RefreshCw } from "lucide-react";

const ThemeToggle = dynamic(
  () => import("@/components/ThemeToggle").then((m) => m.ThemeToggle),
  { ssr: false }
);

const NAV_ITEMS = [
  { href: "/", label: "Saúde" },
  { href: "/disparos", label: "Disparos" },
  { href: "/erros", label: "Erros" },
  { href: "/limites", label: "Limites" },
  { href: "/monitor", label: "Monitor" },
] as const;

export function NavHeader({
  userEmail,
  loading,
  lastUpdated,
  onRefresh,
}: {
  userEmail: string;
  loading: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
              <Activity className="size-4" />
            </div>
            <div>
              <h1 className="text-base leading-tight font-semibold tracking-tight sm:text-lg">
                Painel Axis — BMs &amp; WhatsApp
              </h1>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              {loading && lastUpdated === null ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <button
                  onClick={onRefresh}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted hover:text-foreground"
                  title="Atualizar agora"
                >
                  <RefreshCw className="size-3.5" />
                  {lastUpdated
                    ? `Atualizado ${formatDistanceToNow(lastUpdated, { addSuffix: true, locale: ptBR })}`
                    : "—"}
                </button>
              )}
            </div>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
