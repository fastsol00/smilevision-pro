import { forwardRef } from "react";
import type { Patient, ClinicalCase } from "@/lib/types";
import { DEFAULT_LIFESTYLE } from "@/lib/types";
import { getShadeWhiteningIntensity, getWhiteningFilter } from "@/lib/whitening";
import {
  Cigarette, Coffee, AlertTriangle, Sparkles, Droplet, BadgeCheck,
  Wine, Dumbbell, Zap, Pill, CalendarClock, Calendar,
} from "lucide-react";

interface Props {
  patient: Patient;
  caseData: ClinicalCase;
}

/**
 * Hidden printable layout. Renders the same visual identity as the app
 * so html2canvas can snapshot it for the PDF export.
 *
 * Uses inline / safe Tailwind tokens that html2canvas-pro can parse.
 */
export const CasePdfTemplate = forwardRef<HTMLDivElement, Props>(function CasePdfTemplate(
  { patient, caseData: c },
  ref,
) {
  const ls = patient.lifestyle ?? DEFAULT_LIFESTYLE;
  const lifestyle = buildLifestyle(patient, ls);
  const generated = new Date(c.createdAt).toLocaleDateString("it-IT", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const whitenFilter = getWhiteningFilter(getShadeWhiteningIntensity(c.targetShade));

  return (
    <div
      ref={ref}
      style={{ width: "794px", fontFamily: "Inter, system-ui, sans-serif", color: "#0a1430" }}
      className="bg-white p-8"
    >
      {/* HEADER */}
      <div
        style={{ background: "linear-gradient(135deg, #041632 0%, #1d3a73 100%)" }}
        className="rounded-3xl px-6 py-5 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 font-bold">SV</div>
            <div>
              <div className="text-[20px] font-semibold tracking-tight">SmileVision PRO</div>
              <div className="text-[12px] text-white/70">Scheda sintesi caso clinico whitening</div>
            </div>
          </div>
          <div className="text-right text-[11px] text-white/70">
            <div>Generato il {generated}</div>
            <div>Caso {c.id.toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* PATIENT TOP CARD */}
      <div className="mt-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-[18px] font-semibold text-blue-700 ring-1 ring-slate-200">
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[24px] font-semibold tracking-tight">
                {patient.firstName} {patient.lastName}
              </h1>
              {patient.membership === "Premier" && (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Premier Member
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-600">
              {patient.age && <span className="inline-flex items-center gap-1.5"><Calendar style={{ width: 13, height: 13 }} />{patient.age} anni</span>}
              <span className="inline-flex items-center gap-1.5"><Droplet style={{ width: 13, height: 13 }} />Sensibilità: {patient.sensitivity}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
                <CalendarClock style={{ width: 13, height: 13 }} />
                Ultima visita: {formatVisit(patient.lastVisit)}
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-center">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Hygiene Score</div>
            <div className="mt-0.5 text-[22px] font-semibold leading-none">
              {patient.hygieneScore ?? 80}
              <span className="text-[11px] font-medium text-slate-500">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN */}
      <div className="mt-4 grid grid-cols-5 gap-4">
        {/* LEFT */}
        <div className="col-span-3 space-y-4">
          {/* Anamnesi */}
          <Section title="Anamnesi clinica">
            <DataRow label="Colore target" value={c.targetShade} />
            <DataRow label="Sensibilità" value={c.sensitivity} />
            <DataRow label="Fumatore" value={c.smoker ? "Sì" : "No"} />
            <DataRow label="Tetracicline" value={c.tetracycline ? "Sì" : "No"} />
          </Section>

          {/* Photo before/after */}
          {c.photo && (
            <Section title="Simulazione prima / dopo">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                  <img src={c.photo} alt="Prima" className="block h-40 w-full object-cover" crossOrigin="anonymous" />
                  <div className="absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">Prima</div>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src={c.photo}
                    alt="Dopo"
                    crossOrigin="anonymous"
                    className="block h-40 w-full object-cover"
                    style={{ filter: whitenFilter }}
                  />
                  <div className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-blue-700">Dopo</div>
                </div>
              </div>
              <p className="mt-2 text-[10px] italic text-slate-500">
                Simulazione illustrativa elaborata sulla stessa foto del paziente.
              </p>
            </Section>
          )}

          {/* Protocollo */}
          <Section title="Protocollo">
            <div className="rounded-2xl bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Sparkles style={{ width: 14, height: 14 }} />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Protocollo studio</span>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed">{c.protocolStudio}</p>
            </div>
            <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Protocollo domiciliare</div>
              <p className="mt-1 text-[12.5px] leading-relaxed">{c.protocolHome}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat label="Sedute previste" value={String(c.sedute)} />
              <Stat label="Predicibilità" value={c.predicibilita} />
            </div>
            {c.alert && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900">
                <AlertTriangle style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }} />
                <span>{c.alert}</span>
              </div>
            )}
          </Section>
        </div>

        {/* RIGHT - Lifestyle */}
        <div className="col-span-2 space-y-4">
          <Section title="Fattori lifestyle">
            <div className="space-y-2.5">
              {lifestyle.map((it, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white ring-1 ring-slate-200">
                    <it.icon style={{ width: 16, height: 16 }} />
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="truncate text-[13px] font-semibold">{it.label}</div>
                    <div className="truncate text-[11px] text-slate-500">{it.sub}</div>
                  </div>
                  {it.state === "ok" && (
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                      <BadgeCheck style={{ width: 13, height: 13 }} />
                    </span>
                  )}
                  {it.state === "warn" && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                      Monitor
                    </span>
                  )}
                </div>
              ))}
              {lifestyle.length === 0 && (
                <div className="rounded-2xl bg-slate-50 px-3 py-5 text-center text-[11px] text-slate-500">
                  Nessun fattore lifestyle selezionato.
                </div>
              )}
            </div>
          </Section>

          {patient.notes && (
            <Section title="Note del professionista">
              <p className="text-[12px] leading-relaxed text-slate-700">{patient.notes}</p>
            </Section>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-3 text-[10px] italic text-slate-500">
        Disclaimer: la simulazione e il protocollo hanno finalità illustrative e non rappresentano garanzia di risultato clinico.
        Documento generato da SmileVision PRO — Dr. Antonio Mirone, Igienista Dentale.
      </div>
    </div>
  );
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
      {children}
    </section>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-[13px] font-medium">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2">
      <div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-[18px] font-semibold">{value}</div>
    </div>
  );
}

function formatVisit(date?: string): string {
  if (!date) return "Nessuna";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

type Item = { icon: any; label: string; sub: string; state: "ok" | "warn" | "info" };

function buildLifestyle(patient: Patient, ls: NonNullable<Patient["lifestyle"]>): Item[] {
  const items: (Item | false)[] = [
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
      state: "warn",
    },
    !!ls.bruxism && { icon: Dumbbell, label: "Bruxismo", sub: "Stress su smalto e restauri", state: "info" },
    !!ls.redWine && { icon: Wine, label: "Vino rosso", sub: "Discromia estrinseca", state: "warn" },
    !!ls.sportsDrinks && { icon: Zap, label: "Sport drink", sub: "Rischio erosione", state: "warn" },
    !!ls.poorOralHygiene && { icon: Droplet, label: "Igiene orale", sub: "Da migliorare", state: "warn" },
    patient.tetracycline && { icon: Pill, label: "Tetracicline", sub: "Discromia intrinseca", state: "warn" },
  ];
  return items.filter(Boolean) as Item[];
}
