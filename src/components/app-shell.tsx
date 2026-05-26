import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Sparkles as SparkIcon, Settings, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./logo";
import { getCurrentUser, useAuthStore } from "@/lib/auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/app/patients", label: "Pazienti", icon: Users },
  { to: "/app/simulations", label: "Simulazioni", icon: SparkIcon },
] as const;

export function AppShell({ children, topBar }: { children: React.ReactNode; topBar?: React.ReactNode }) {
  const loc = useLocation();
  const user = useAuthStore((state) => state.user);
  const updateEmail = useAuthStore((state) => state.updateEmail);
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState(user.email);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetSettingsFields = () => {
    const latestUser = getCurrentUser();
    setEmailDraft(latestUser.email);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleOpenChange = (open: boolean) => {
    setSettingsOpen(open);
    if (open) {
      resetSettingsFields();
    }
  };

  const saveEmail = () => {
    const normalized = emailDraft.trim().toLowerCase();
    if (!normalized) {
      toast.error("Inserisci un indirizzo email valido.");
      return;
    }
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    if (!isValidEmail) {
      toast.error("L'indirizzo email non è valido.");
      return;
    }
    updateEmail(normalized);
    setEmailDraft(normalized);
    toast.success("Email aggiornata con successo.");
  };

  const savePassword = () => {
    if (newPassword.length < 8) {
      toast.error("La nuova password deve avere almeno 8 caratteri.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("La conferma password non coincide.");
      return;
    }
    updatePassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password aggiornata con successo.");
  };

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
              <button
                type="button"
                onClick={() => handleOpenChange(true)}
                className="hidden md:grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-card text-muted-foreground hover:text-foreground"
                aria-label="Apri impostazioni account"
              >
                <Settings className="h-4 w-4" />
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

      <Dialog open={settingsOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-xl rounded-[1.4rem] border border-border/70 p-0 shadow-[0_30px_80px_-35px_rgba(2,8,23,0.28)]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pt-6 pb-4">
              <DialogTitle>Impostazioni account</DialogTitle>
              <DialogDescription className="mt-1">
              Aggiorna email e password. Le modifiche vengono salvate subito su questo dispositivo.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <section className="space-y-3 rounded-[1.35rem] border border-border/60 bg-muted/25 p-4">
              <div>
                <div className="text-sm font-semibold text-foreground">Email di accesso</div>
                <div className="text-xs text-muted-foreground">Verrà usata immediatamente anche nella schermata di login.</div>
              </div>
              <Input
                type="email"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                className="h-11 rounded-[0.95rem] bg-background"
                placeholder="nome@studio.it"
                autoComplete="email"
              />
              <div className="flex justify-end">
                <Button type="button" onClick={saveEmail} className="rounded-[0.95rem]">
                  Salva email
                </Button>
              </div>
            </section>

            <section className="space-y-3 rounded-[1.35rem] border border-border/60 bg-muted/25 p-4">
              <div>
                <div className="text-sm font-semibold text-foreground">Password</div>
                <div className="text-xs text-muted-foreground">Imposta una nuova password e confermala qui sotto.</div>
              </div>

              <PasswordField
                label="Nuova password"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNewPassword}
                onToggleVisibility={() => setShowNewPassword((value) => !value)}
                autoComplete="new-password"
              />
              <PasswordField
                label="Conferma nuova password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirmPassword}
                onToggleVisibility={() => setShowConfirmPassword((value) => !value)}
                autoComplete="new-password"
              />

              <DialogFooter className="pt-1">
                <Button type="button" onClick={savePassword} className="rounded-[0.95rem]">
                  Aggiorna password
                </Button>
              </DialogFooter>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { Plus };

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggleVisibility,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  autoComplete: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-semibold text-foreground">{label}</label>
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 rounded-[0.95rem] bg-background pr-11"
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Nascondi password" : "Mostra password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
