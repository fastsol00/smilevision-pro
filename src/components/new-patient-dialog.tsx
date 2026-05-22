import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SHADES, SENSITIVITIES, DEFAULT_LIFESTYLE } from "@/lib/types";
import type { Patient, ShadeColor, Sensitivity, Lifestyle } from "@/lib/types";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import {
  BadgeCheck, Activity, Coffee, Brain, Droplet, ShieldCheck,
  Clipboard, Wine, Zap, AlertTriangle, ArrowLeft, ArrowRight, Pill,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (p: Patient) => void;
  prefillName?: string;
}

type LifestyleKey =
  | "nonSmoker" | "smoker" | "tetracycline" | "coffeeTea" | "bruxism" | "redWine"
  | "refluxAcidDiet" | "dentalRestorations" | "poorOralHygiene" | "sportsDrinks" | "xerostomia";

type Tone = "ok" | "warn" | "info" | "neutral";

const LIFESTYLE_OPTIONS: { key: LifestyleKey; icon: any; label: string; sub: string; tone: Tone }[] = [
  { key: "nonSmoker",          icon: BadgeCheck, label: "Non fumatore",             sub: "Abitudine favorevole alla stabilità cromatica", tone: "ok" },
  { key: "smoker",             icon: Activity,   label: "Fumatore",                 sub: "Maggiore rischio di pigmentazioni e recidiva",  tone: "warn" },
  { key: "tetracycline",       icon: Pill,       label: "Tetracicline",             sub: "Discromia intrinseca da farmaci",              tone: "warn" },
  { key: "coffeeTea",          icon: Coffee,     label: "Caffè e tè",               sub: "Assunzione frequente di cromogeni",            tone: "warn" },
  { key: "bruxism",            icon: Brain,      label: "Bruxismo riferito",        sub: "Possibile stress su smalto e restauri",        tone: "info" },
  { key: "refluxAcidDiet",     icon: AlertTriangle, label: "Reflusso o dieta acida", sub: "Possibile erosione e sensibilità aumentata", tone: "warn" },
  { key: "dentalRestorations", icon: ShieldCheck, label: "Restauri anteriori",      sub: "Da valutare per mismatch cromatico",           tone: "neutral" },
  { key: "poorOralHygiene",    icon: Clipboard,   label: "Igiene domiciliare irregolare", sub: "Rinforzare istruzioni pre e post trattamento", tone: "warn" },
  { key: "xerostomia",         icon: Droplet,     label: "Xerostomia",              sub: "Comfort e mineralizzazione da monitorare",    tone: "info" },
  { key: "redWine",            icon: Wine,        label: "Vino rosso",              sub: "Discromia estrinseca da pigmenti",             tone: "warn" },
  { key: "sportsDrinks",       icon: Zap,         label: "Sport drink",             sub: "Rischio erosione dello smalto",                tone: "warn" },
];

const splitName = (full?: string): { first: string; last: string } => {
  if (!full) return { first: "", last: "" };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
};

export function NewPatientDialog({ open, onOpenChange, onCreated, prefillName }: Props) {
  const addPatient = useStore((s) => s.addPatient);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [age, setAge] = useState<string>("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sens, setSens] = useState<Sensitivity>("Assente");
  const [shade, setShade] = useState<ShadeColor>("B1");
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<Set<LifestyleKey>>(new Set(["nonSmoker"]));

  useEffect(() => {
    if (open && prefillName) {
      const { first: f, last: l } = splitName(prefillName);
      setFirst(f); setLast(l);
    }
  }, [open, prefillName]);

  const reset = () => {
    setStep(1);
    setFirst(""); setLast(""); setAge(""); setEmail(""); setPhone("");
    setSens("Assente"); setShade("B1"); setNotes("");
    setSelected(new Set(["nonSmoker"]));
  };

  const toggle = (k: LifestyleKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) { next.delete(k); return next; }
      // Smoker / Non-smoker mutually exclusive
      if (k === "smoker") next.delete("nonSmoker");
      if (k === "nonSmoker") next.delete("smoker");
      next.add(k);
      return next;
    });
  };

  const buildLifestyle = (): Lifestyle => {
    const ls: Lifestyle = { ...DEFAULT_LIFESTYLE };
    if (selected.has("coffeeTea")) ls.coffeeTea = "moderate";
    ls.bruxism = selected.has("bruxism");
    ls.redWine = selected.has("redWine");
    ls.sportsDrinks = selected.has("sportsDrinks");
    ls.poorOralHygiene = selected.has("poorOralHygiene");
    ls.refluxAcidDiet = selected.has("refluxAcidDiet");
    ls.dentalRestorations = selected.has("dentalRestorations");
    ls.xerostomia = selected.has("xerostomia");
    return ls;
  };

  const save = () => {
    if (!first.trim() || !last.trim()) { toast.error("Nome e cognome obbligatori"); setStep(1); return; }
    const p = addPatient({
      firstName: first.trim(),
      lastName: last.trim(),
      age: age ? Number(age) : undefined,
      email: email || undefined,
      phone: phone || undefined,
      notes: notes || undefined,
      smoker: selected.has("smoker"),
      tetracycline: selected.has("tetracycline"),
      sensitivity: sens,
      targetShade: shade,
      lifestyle: buildLifestyle(),
      membership: "Standard",
      hygieneScore: 80,
    });
    toast.success("Paziente creato");
    reset();
    onOpenChange(false);
    onCreated?.(p);
  };

  const next = () => {
    if (step === 1 && (!first.trim() || !last.trim())) {
      toast.error("Nome e cognome obbligatori"); return;
    }
    setStep((s) => (s === 3 ? s : ((s + 1) as 2 | 3)));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        <div className="border-b border-border/60 px-7 py-5">
          <div className="flex items-center justify-between gap-4">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="font-display text-2xl">Nuovo paziente</DialogTitle>
              <DialogDescription className="text-[13px]">
                {step === 1 && "Dati anagrafici e di contatto."}
                {step === 2 && "Fattori lifestyle"}
                {step === 3 && "Anamnesi clinica e note."}
              </DialogDescription>
            </DialogHeader>
            <span className="rounded-full bg-muted px-3 py-1 text-[12px] font-semibold text-muted-foreground">
              {step}/3
            </span>
          </div>
          {step === 2 && (
            <p className="mt-2 text-[13px] text-muted-foreground">Seleziona gli elementi utili al recap clinico.</p>
          )}
        </div>

        <div className="px-7 py-6">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Nome *</Label><Input value={first} onChange={(e) => setFirst(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Cognome *</Label><Input value={last} onChange={(e) => setLast(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Età</Label><Input type="number" value={age} onChange={(e) => setAge(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Telefono</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {LIFESTYLE_OPTIONS.map(({ key, ...opt }) => (
                <LifestyleCard key={key} {...opt} active={selected.has(key)} onClick={() => toggle(key)} />
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Colore target</Label>
                <Select value={shade} onValueChange={(v) => setShade(v as ShadeColor)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SHADES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sensibilità</Label>
                <Select value={sens} onValueChange={(v) => setSens(v as Sensitivity)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SENSITIVITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5"><Label>Note</Label><Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border/60 bg-muted/30 px-7 py-4">
          {step > 1 ? (
            <Button variant="ghost" className="rounded-full" onClick={() => setStep((s) => (s - 1) as 1 | 2)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Indietro
            </Button>
          ) : (
            <Button variant="ghost" className="rounded-full" onClick={() => { onOpenChange(false); reset(); }}>
              Annulla
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={next} className="ml-auto h-12 flex-1 rounded-full text-[14px] font-semibold">
              Continua <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={save} className="ml-auto h-12 flex-1 rounded-full text-[14px] font-semibold">
              Salva paziente
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LifestyleCard({
  icon: Icon, label, sub, tone, active, onClick,
}: { icon: any; label: string; sub: string; tone: Tone; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-3.5 rounded-full border px-3 py-3 text-left transition",
        active
          ? "border-foreground bg-foreground text-background shadow-md"
          : "border-border/70 bg-card hover:border-border hover:bg-muted/30",
      ].join(" ")}
    >
      <span
        className={[
          "grid h-11 w-11 shrink-0 place-items-center rounded-full transition",
          active ? "bg-background/15 text-background" : "bg-muted text-foreground/70",
        ].join(" ")}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className={`block text-[14px] font-semibold ${active ? "text-background" : "text-foreground"}`}>
          {label}
        </span>
        <span className={`mt-0.5 block truncate text-[12px] ${active ? "text-background/70" : "text-muted-foreground"}`}>
          {sub}
        </span>
      </span>
    </button>
  );
}
