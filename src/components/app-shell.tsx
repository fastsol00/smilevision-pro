import { Link, useLocation } from "@tanstack/react-router";
import { Users, Sparkles as SparkIcon, Bell, Plus } from "lucide-react";
import { Logo } from "./logo";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { to: "/app/patients", label: "Pazienti", icon: Users },
  { to: "/app/simulations", label: "Simulazioni", icon: SparkIcon },
] as const;

export function AppShell({ children, topBar }: { children: React.ReactNode; topBar?: React.ReactNode }) {
  const loc = useLocation();
  const user = getCurrentUser();
  return (
    <div className="min-h-screen overflow-x-hidden bg-[oklch(0.98_0.005_240)]">
      <div className="flex min-h-screen items-stretch">
        <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card md:flex">
          <div className="flex min-h-screen flex-1 flex-col gap-2 px-4 py-6">
            <div className="px-1"><Logo /></div>
            <nav className="mt-6 flex flex-col gap-1">
              {NAV.map((n) => {
                const active = loc.pathname.startsWith(n.to);
                const Icon = n.icon;
                return (
                  <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted"}`}>
                    <Icon className="h-4 w-4" />{n.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto rounded-xl border bg-muted/40 p-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">AM</div>
                <div className="leading-tight">
                  <div className="text-[13px] font-medium text-foreground">{user.fullName}</div>
                  <div className="text-[11px] text-muted-foreground capitalize">{user.role}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur md:px-8">
            <div className="md:hidden"><Logo /></div>
            <div className="hidden flex-1 md:block" />
            <div className="ml-auto flex items-center gap-2">
              {topBar}
              <button className="hidden md:grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-card text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </header>
          <div className="min-w-0 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8">{children}</div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border/60 bg-card/95 backdrop-blur md:hidden">
        {NAV.map((n) => {
          const active = loc.pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="h-5 w-5" />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export { Plus };
