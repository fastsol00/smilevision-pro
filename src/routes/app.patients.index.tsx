import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { NewPatientDialog } from "@/components/new-patient-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Search, User, Sparkles, BadgeCheck, Droplet, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/patients/")({ component: Page });

function Page() {
  const patients = useStore((s) => s.patients);
  const cases = useStore((s) => s.cases);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const nav = useNavigate();

  const filtered = patients.filter(
    (p) => !q || `${p.firstName} ${p.lastName}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell
      topBar={
        <>
          <Button variant="outline" className="rounded-full" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Aggiungi paziente
          </Button>
          <Link to="/app/simulations" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
            <Sparkles className="h-4 w-4" /> Nuovo caso
          </Link>
        </>
      }
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Patients</div>
          <h1 className="mt-1 font-display text-[28px] font-semibold tracking-tight text-foreground">Pazienti</h1>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca paziente…" className="h-10 w-full rounded-full border border-border/70 bg-card pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="svp-card flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-medical-soft)] text-primary">
            <User className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold">Nessun paziente in archivio</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Crea la prima scheda paziente per iniziare a generare protocolli di sbiancamento personalizzati.</p>
          <Button className="mt-5 rounded-full" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Aggiungi nuovo paziente
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p, i) => {
            const n = cases.filter((c) => c.patientId === p.id).length;
            const score = p.hygieneScore ?? 80;
            return (
              <motion.button
                key={p.id}
                onClick={() => nav({ to: "/app/patients/$id", params: { id: p.id } })}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="svp-card group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-sm font-semibold text-primary ring-1 ring-border/60">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 ring-2 ring-card">
                      <BadgeCheck className="h-2.5 w-2.5 text-white" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-display text-[17px] font-semibold text-foreground">
                        {p.firstName} {p.lastName}
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                    <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                      {p.age ? `${p.age} anni · ` : ""}ID: SV-{p.id.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {p.membership === "Premier" ? (
                    <span className="rounded-full bg-[var(--color-medical-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                      Premier
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Standard
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    <Droplet className="h-3 w-3" /> Sens. {p.sensitivity}
                  </span>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-border/60 pt-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Target</div>
                    <div className="font-display text-[18px] font-semibold text-foreground">{p.targetShade}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Casi</div>
                    <div className="font-display text-[18px] font-semibold text-foreground">{n}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Hygiene</div>
                    <div className="font-display text-[18px] font-semibold text-foreground">
                      {score}<span className="text-[11px] font-medium text-muted-foreground">/100</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      <NewPatientDialog open={open} onOpenChange={setOpen} onCreated={(p) => nav({ to: "/app/patients/$id", params: { id: p.id } })} />
    </AppShell>
  );
}
