import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Cigarette, Coffee, AlertTriangle, FileText, Sparkles, Trash2, Droplet, BadgeCheck, ChevronRight, Pencil, Info, Wine, Dumbbell, Zap, Pill, Calendar, Mail, Phone, UserRound, CalendarClock, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DEFAULT_LIFESTYLE } from "@/lib/types";
import { EditPatientDialog } from "@/components/edit-patient-dialog";

export const Route = createFileRoute("/app/patients/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const patients = useStore((s) => s.patients);
  const allCases = useStore((s) => s.cases);
  const patient = useMemo(() => patients.find((p) => p.id === id), [patients, id]);
  const cases = useMemo(() => allCases.filter((c) => c.patientId === id), [allCases, id]);
  const deletePatient = useStore((s) => s.deletePatient);
  const deleteCase = useStore((s) => s.deleteCase);
  const updatePatient = useStore((s) => s.updatePatient);
  const nav = useNavigate();
  const [editHygiene, setEditHygiene] = useState(false);
  const [hygieneDraft, setHygieneDraft] = useState<string>("");
  const [editOpen, setEditOpen] = useState(false);

  if (!patient) {
    return (
      <AppShell>
        <div className="svp-card flex flex-col items-center justify-center px-6 py-24 text-center">
          <h2 className="font-display text-xl font-semibold">Paziente non trovato</h2>
          <p className="mt-1 text-sm text-muted-foreground">La scheda richiesta non esiste o è stata rimossa.</p>
          <Link to="/app/patients" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
            <ArrowLeft className="h-4 w-4" /> Torna all'elenco
          </Link>
        </div>
      </AppShell>
    );
  }

  const last = cases[0];

  const remove = () => {
    if (!confirm("Eliminare il paziente e tutti i casi?")) return;
    deletePatient(id);
    toast.success("Paziente eliminato");
    nav({ to: "/app/patients" });
  };

  return (
    <AppShell
      topBar={
        <Link to="/app/simulations" search={{ patientId: id } as never} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
          <Sparkles className="h-4 w-4" /> Nuovo caso
        </Link>
      }
    >
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/app/patients" className="inline-flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Pazienti</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{patient.firstName} {patient.lastName}</span>
      </div>

      {/* Riepilogo bar — header style */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="svp-card flex flex-wrap items-center gap-6 px-6 py-5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-semibold text-primary ring-1 ring-border/60">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 ring-2 ring-card">
              <BadgeCheck className="h-3 w-3 text-white" />
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[28px] font-semibold tracking-tight text-foreground">{patient.firstName} {patient.lastName}</h1>
              {patient.membership === "Premier" && (
                <span className="rounded-full bg-[var(--color-medical-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Premier Member</span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              {patient.age && <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{patient.age} anni</span>}
              <span className="inline-flex items-center gap-1.5"><Droplet className="h-3.5 w-3.5" />Sensibilità: {patient.sensitivity}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-medical-soft)] px-2.5 py-0.5 text-[11px] font-medium text-primary">
                <CalendarClock className="h-3.5 w-3.5" />
                Ultima visita: {formatVisit(patient.lastVisit)}
              </span>
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-muted/60 px-4 py-2.5">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Hygiene Score</div>
              {editHygiene ? (
                <div className="mt-1 flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    autoFocus
                    value={hygieneDraft}
                    onChange={(e) => setHygieneDraft(e.target.value)}
                    className="h-8 w-16 rounded-full text-center font-display text-base"
                  />
                  <button
                    type="button"
                    className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground"
                    onClick={() => {
                      const n = Math.max(0, Math.min(100, Number(hygieneDraft) || 0));
                      updatePatient(patient.id, { hygieneScore: n });
                      setEditHygiene(false);
                      toast.success("Hygiene score aggiornato");
                    }}
                    aria-label="Conferma"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { setHygieneDraft(String(patient.hygieneScore ?? 80)); setEditHygiene(true); }}
                  className="mt-0.5 inline-flex items-baseline gap-0.5 font-display text-[22px] font-semibold leading-none text-foreground hover:opacity-80"
                  title="Clicca per modificare"
                >
                  {patient.hygieneScore ?? 80}<span className="text-[12px] font-medium text-muted-foreground">/100</span>
                </button>
              )}
            </div>
            <div className="h-10 w-px bg-border/70" />
            <button
              onClick={() => setEditOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90"
              aria-label="Modifica paziente"
              title="Modifica paziente"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <EditPatientDialog open={editOpen} onOpenChange={setEditOpen} patient={patient} />

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          {/* Anagrafica — clean inline list */}
          <Card title="Dati anagrafici">
            <dl className="divide-y divide-border/60">
              <Row icon={UserRound} label="Nome completo" value={`${patient.firstName} ${patient.lastName}`} />
              <Row icon={Calendar} label="Età" value={patient.age ? `${patient.age} anni` : "—"} />
              <Row icon={Mail} label="Email" value={patient.email || "—"} />
              <Row icon={Phone} label="Telefono" value={patient.phone || "—"} />
              <Row icon={Calendar} label="Creato" value={new Date(patient.createdAt).toLocaleDateString("it-IT")} />
            </dl>
          </Card>

          {/* Anamnesi clinica — clean inline list */}
          <Card title="Anamnesi clinica">
            <dl className="divide-y divide-border/60">
              <Row label="Colore target" value={patient.targetShade} />
              <Row label="Sensibilità" value={patient.sensitivity} />
              <Row label="Fumatore" value={patient.smoker ? "Sì" : "No"} />
              <Row label="Tetracicline" value={patient.tetracycline ? "Sì" : "No"} />
            </dl>
          </Card>



          {/* Storico simulazioni / trattamenti */}
          <Card title="Storico casi clinici" action={
            <Link to="/app/simulations" search={{ patientId: id } as never} className="text-[12px] font-medium text-primary hover:underline">+ Nuovo caso</Link>
          }>
            {cases.length === 0 ? (
              <div className="rounded-xl bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                Nessun caso registrato. Crea una nuova simulazione whitening.
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {cases.map((c) => (
                  <li key={c.id} className="flex items-center gap-4 py-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-medical-soft)] text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">Caso {c.id.toUpperCase()}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{c.predicibilita}</span>
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        {new Date(c.createdAt).toLocaleString("it-IT")} · Target {c.targetShade} · {c.sedute} sedute
                      </div>
                    </div>
                    <button onClick={() => { deleteCase(c.id); toast.success("Caso eliminato"); }} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Elimina caso">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Note */}
          <Card title="Note del professionista">
            <p className="text-sm leading-relaxed text-muted-foreground">{patient.notes || "Nessuna nota interna registrata."}</p>
          </Card>
        </div>

        <div className="space-y-5 lg:col-span-2">
          {/* Lifestyle factors — screenshot style */}
          <LifestyleCard patient={patient} />


          {/* Warning clinici */}
          {last?.alert && (
            <Card title="Warning clinici">
              <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{last.alert}</span>
              </div>
            </Card>
          )}

          {/* PDF generati */}
          <Card title="Documenti PDF">
            {cases.filter((c) => c.pdfName).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun PDF generato.</p>
            ) : (
              <ul className="space-y-2">
                {cases.filter((c) => c.pdfName).map((c) => (
                  <li key={c.id} className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="truncate">{c.pdfName}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Button variant="ghost" onClick={remove} className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="mr-1.5 h-4 w-4" /> Elimina paziente
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/50 px-4 py-2.5 text-right">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-[18px] font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Card({ title, children, action, subtle }: { title: string; children: React.ReactNode; action?: React.ReactNode; subtle?: boolean }) {
  return (
    <section className={subtle ? "svp-card p-5" : "svp-card p-5"}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Row({ icon: Icon, label, value }: { icon?: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </div>
      <div className="truncate text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function formatVisit(date?: string): string {
  if (!date) return "Nessuna";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

type RowState = "ok" | "warn" | "info";

function LifestyleCard({ patient }: { patient: { smoker: boolean; tetracycline: boolean; lifestyle?: any } }) {
  const ls = patient.lifestyle ?? DEFAULT_LIFESTYLE;
  type Item = { icon: any; label: string; sub: string; state: RowState };
  const items: Item[] = [
    {
      icon: Cigarette,
      label: patient.smoker ? "Fumatore" : "Non fumatore",
      sub: patient.smoker ? "Monitorare attentamente" : "Abitudine favorevole",
      state: patient.smoker ? "warn" : "ok",
    },
    ls.coffeeTea !== "none" && {
      icon: Coffee,
      label: "Caffè / tè",
      sub: ls.coffeeTea === "high" ? "Assunzione elevata" : ls.coffeeTea === "moderate" ? "Assunzione moderata" : "Assunzione bassa",
      state: "warn" as RowState,
    },
    ls.bruxism && { icon: Dumbbell, label: "Bruxismo", sub: "Stress su smalto e restauri", state: "info" as RowState },
    ls.redWine && { icon: Wine, label: "Vino rosso", sub: "Discromia estrinseca", state: "warn" as RowState },
    ls.sportsDrinks && { icon: Zap, label: "Sport drink", sub: "Rischio erosione", state: "warn" as RowState },
    ls.poorOralHygiene && { icon: Droplet, label: "Igiene orale", sub: "Da migliorare", state: "warn" as RowState },
    patient.tetracycline && { icon: Pill, label: "Tetracicline", sub: "Discromia intrinseca", state: "warn" as RowState },
  ].filter(Boolean) as Item[];

  return (
    <section className="svp-card p-6">
      <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Fattori lifestyle
      </div>
      <div className="space-y-3">
        {items.map((it, i) => (
          <LifestyleRow key={i} {...it} />
        ))}
        {items.length === 0 && (
          <div className="rounded-2xl bg-muted/40 px-4 py-6 text-center text-[12px] text-muted-foreground">
            Nessun fattore lifestyle selezionato.
          </div>
        )}
      </div>
    </section>
  );
}

function LifestyleRow({ icon: Icon, label, sub, state }: { icon: any; label: string; sub: string; state: RowState }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-muted/40 px-4 py-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-card shadow-sm ring-1 ring-border/40">
        <Icon className="h-5 w-5 text-foreground" />
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[15px] font-semibold text-foreground">{label}</div>
        <div className="truncate text-[12px] text-muted-foreground">{sub}</div>
      </div>
      {state === "ok" && (
        <span className="shrink-0 grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white">
          <BadgeCheck className="h-4 w-4" />
        </span>
      )}
      {state === "warn" && (
        <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
          Monitor
        </span>
      )}
      {state === "info" && (
        <span className="shrink-0 grid h-7 w-7 place-items-center rounded-full text-muted-foreground ring-1 ring-border/60">
          <Info className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}
