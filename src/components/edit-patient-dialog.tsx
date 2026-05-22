import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SHADES, SENSITIVITIES, DEFAULT_LIFESTYLE } from "@/lib/types";
import type { Patient, ShadeColor, Sensitivity, Lifestyle } from "@/lib/types";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  patient: Patient;
}

export function EditPatientDialog({ open, onOpenChange, patient }: Props) {
  const updatePatient = useStore((s) => s.updatePatient);
  const [first, setFirst] = useState(patient.firstName);
  const [last, setLast] = useState(patient.lastName);
  const [age, setAge] = useState<string>(patient.age ? String(patient.age) : "");
  const [email, setEmail] = useState(patient.email ?? "");
  const [phone, setPhone] = useState(patient.phone ?? "");
  const [notes, setNotes] = useState(patient.notes ?? "");
  const [sens, setSens] = useState<Sensitivity>(patient.sensitivity);
  const [shade, setShade] = useState<ShadeColor>(patient.targetShade);
  const [smoker, setSmoker] = useState(patient.smoker);
  const [tetracycline, setTetracycline] = useState(patient.tetracycline);
  const [hygiene, setHygiene] = useState<string>(String(patient.hygieneScore ?? 80));
  const [ls, setLs] = useState<Lifestyle>(patient.lifestyle ?? DEFAULT_LIFESTYLE);

  useEffect(() => {
    if (open) {
      setFirst(patient.firstName); setLast(patient.lastName);
      setAge(patient.age ? String(patient.age) : "");
      setEmail(patient.email ?? ""); setPhone(patient.phone ?? "");
      setNotes(patient.notes ?? ""); setSens(patient.sensitivity);
      setShade(patient.targetShade); setSmoker(patient.smoker);
      setTetracycline(patient.tetracycline);
      setHygiene(String(patient.hygieneScore ?? 80));
      setLs(patient.lifestyle ?? DEFAULT_LIFESTYLE);
    }
  }, [open, patient]);

  const save = () => {
    if (!first.trim() || !last.trim()) { toast.error("Nome e cognome obbligatori"); return; }
    updatePatient(patient.id, {
      firstName: first.trim(),
      lastName: last.trim(),
      age: age ? Number(age) : undefined,
      email: email || undefined,
      phone: phone || undefined,
      notes: notes || undefined,
      sensitivity: sens,
      targetShade: shade,
      smoker,
      tetracycline,
      hygieneScore: Math.max(0, Math.min(100, Number(hygiene) || 0)),
      lifestyle: ls,
    });
    toast.success("Paziente aggiornato");
    onOpenChange(false);
  };

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        <div className="border-b border-border/60 px-6 py-5">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="font-display text-2xl">Modifica paziente</DialogTitle>
            <DialogDescription className="text-[13px]">Aggiorna i dati anagrafici, clinici e di lifestyle.</DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-6 py-6">
          <section>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Anagrafica</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Nome *</Label><Input value={first} onChange={(e) => setFirst(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Cognome *</Label><Input value={last} onChange={(e) => setLast(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Età</Label><Input type="number" value={age} onChange={(e) => setAge(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Telefono</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="sm:col-span-2 space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Anamnesi clinica</h4>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <Toggle label="Fumatore" value={smoker} onChange={setSmoker} />
              <Toggle label="Tetracicline" value={tetracycline} onChange={setTetracycline} />
              <div className="space-y-1.5">
                <Label>Hygiene Score (0-100)</Label>
                <Input type="number" min={0} max={100} value={hygiene} onChange={(e) => setHygiene(e.target.value)} />
              </div>
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Lifestyle</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Caffè / tè</Label>
                <Select value={ls.coffeeTea} onValueChange={(v) => setLs({ ...ls, coffeeTea: v as Lifestyle["coffeeTea"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessuno</SelectItem>
                    <SelectItem value="low">Basso</SelectItem>
                    <SelectItem value="moderate">Moderato</SelectItem>
                    <SelectItem value="high">Elevato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Toggle label="Bruxismo" value={!!ls.bruxism} onChange={(v) => setLs({ ...ls, bruxism: v })} />
              <Toggle label="Vino rosso" value={!!ls.redWine} onChange={(v) => setLs({ ...ls, redWine: v })} />
              <Toggle label="Sport drink" value={!!ls.sportsDrinks} onChange={(v) => setLs({ ...ls, sportsDrinks: v })} />
              <Toggle label="Igiene orale carente" value={!!ls.poorOralHygiene} onChange={(v) => setLs({ ...ls, poorOralHygiene: v })} />
              <Toggle label="Reflusso / dieta acida" value={!!ls.refluxAcidDiet} onChange={(v) => setLs({ ...ls, refluxAcidDiet: v })} />
              <Toggle label="Restauri anteriori" value={!!ls.dentalRestorations} onChange={(v) => setLs({ ...ls, dentalRestorations: v })} />
              <Toggle label="Xerostomia" value={!!ls.xerostomia} onChange={(v) => setLs({ ...ls, xerostomia: v })} />
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Note</h4>
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </section>
        </div>

        <div className="flex items-center gap-3 border-t border-border/60 bg-muted/30 px-6 py-4">
          <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button onClick={save} className="ml-auto h-11 rounded-full px-6 text-[14px] font-semibold">Salva modifiche</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
