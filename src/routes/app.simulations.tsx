import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { NewPatientDialog } from "@/components/new-patient-dialog";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { CameraCaptureButton } from "@/components/camera-capture-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { findProtocol } from "@/lib/protocol-matrix";
import { SHADES, SENSITIVITIES } from "@/lib/types";
import type { ShadeColor, Sensitivity } from "@/lib/types";
import { generateCasePdfFromElement, downloadPdf, type GeneratedPdf } from "@/lib/pdf";
import { CasePdfTemplate } from "@/components/case-pdf-template";
import { Plus, Sparkles, FileDown, Save, Upload, AlertTriangle, Camera } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PatientCombobox } from "@/components/patient-combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const searchSchema = z.object({ patientId: z.string().optional() });

export const Route = createFileRoute("/app/simulations")({
  component: Page,
  validateSearch: searchSchema,
});

function Page() {
  const { patientId } = Route.useSearch();
  const nav = useNavigate();
  const patients = useStore((s) => s.patients);
  const addCase = useStore((s) => s.addCase);

  const [selectedId, setSelectedId] = useState<string>(patientId ?? "");
  const selected = patients.find((p) => p.id === selectedId) ?? null;

  const [shade, setShade] = useState<ShadeColor>(selected?.targetShade ?? "B1");
  const [smoker, setSmoker] = useState(selected?.smoker ?? false);
  const [sens, setSens] = useState<Sensitivity>(selected?.sensitivity ?? "Assente");
  const [tetra, setTetra] = useState(selected?.tetracycline ?? false);
  const [photo, setPhoto] = useState<string | undefined>();
  const [openNew, setOpenNew] = useState(false);
  const [prefillName, setPrefillName] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [previewPdf, setPreviewPdf] = useState<GeneratedPdf | null>(null);

  const onSelectPatient = (id: string) => {
    setSelectedId(id);
    const p = patients.find((x) => x.id === id);
    if (p) { setShade(p.targetShade); setSmoker(p.smoker); setSens(p.sensitivity); setTetra(p.tetracycline); }
  };

  const protocol = useMemo(
    () => findProtocol({ targetShade: shade, smoker, sensitivity: sens, tetracycline: tetra }),
    [shade, smoker, sens, tetra],
  );

  const onPhoto = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const onCapturedPhoto = (imageDataUrl: string) => {
    setPhoto(imageDataUrl);
  };

  const save = () => {
    if (!selected) { toast.error("Seleziona un paziente"); return; }
    if (!protocol) { toast.error("Protocollo non disponibile per questa combinazione"); return; }
    const cs = addCase({
      patientId: selected.id,
      targetShade: shade, smoker, sensitivity: sens, tetracycline: tetra,
      photo,
      protocolStudio: protocol.protocolStudio,
      protocolHome: protocol.protocolHome,
      sedute: protocol.sedute,
      predicibilita: protocol.predicibilita,
      alert: protocol.alert,
      professionalNotes: "",
    });
    toast.success("Caso salvato nello storico paziente");
    nav({ to: "/app/patients/$id", params: { id: cs.patientId } });
  };

  const pdfCase = useMemo(() => {
    if (!selected || !protocol) return null;
    return {
      id: "preview",
      patientId: selected.id,
      createdAt: new Date().toISOString(),
      targetShade: shade, smoker, sensitivity: sens, tetracycline: tetra,
      photo,
      protocolStudio: protocol.protocolStudio,
      protocolHome: protocol.protocolHome,
      sedute: protocol.sedute,
      predicibilita: protocol.predicibilita,
      alert: protocol.alert,
      professionalNotes: "",
    };
  }, [selected, protocol, shade, smoker, sens, tetra, photo]);

  const exportPdf = async () => {
    if (!selected) { toast.error("Seleziona un paziente per esportare il PDF"); return; }
    if (!protocol || !pdfCase) { toast.error("Protocollo non disponibile"); return; }
    const el = pdfRef.current;
    if (!el) { toast.error("Template PDF non disponibile"); return; }

    try {
      setExporting(true);
      const generated = await generateCasePdfFromElement(el, selected, pdfCase);
      // Revoke previous preview URL if any
      setPreviewPdf((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return generated;
      });
    } catch (err) {
      console.error(err);
      toast.error("Errore durante l'esportazione del PDF");
    } finally {
      setExporting(false);
    }
  };

  const confirmDownload = () => {
    if (!previewPdf) return;
    downloadPdf(previewPdf);
    toast.success(`PDF scaricato: ${previewPdf.filename}`);
    closePreview();
  };

  const closePreview = () => {
    setPreviewPdf((prev) => {
      if (prev) {
        // Delay revoke so the iframe doesn't break mid-close animation
        setTimeout(() => URL.revokeObjectURL(prev.url), 1500);
      }
      return null;
    });
  };

  return (
    <AppShell
      topBar={
        <>
          <Button variant="outline" className="rounded-full" onClick={() => setOpenNew(true)}>
            <Plus className="mr-1 h-4 w-4" /> Aggiungi paziente
          </Button>
          <Button className="rounded-full" onClick={save}>
            <Sparkles className="mr-1.5 h-4 w-4" /> Nuovo caso
          </Button>
        </>
      }
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Workspace</div>
          <h1 className="mt-1 font-display text-[28px] font-semibold tracking-tight text-foreground">
            Simulazione Whitening
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Carica la foto del sorriso, compila i parametri clinici e ottieni in tempo reale il protocollo personalizzato.
          </p>
        </div>

        {/* Patient search/select for THIS simulation */}
        <div className="w-full max-w-md">
          <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Paziente</Label>
          <div className="mt-1.5">
             <PatientCombobox
              patients={patients}
              selectedId={selectedId}
              onSelect={onSelectPatient}
              onCreateNew={(name) => { setPrefillName(name); setOpenNew(true); }}
            />
          </div>
          {selected && (
            <div className="mt-2 text-[11px] text-muted-foreground">
              Caso in corso per <span className="font-medium text-foreground">{selected.firstName} {selected.lastName}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── ANAMNESI HORIZONTAL ── */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="svp-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-foreground">Anamnesi & parametri clinici</h3>
          {!selected && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5" /> Seleziona un paziente per salvare il caso
            </span>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
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
          <div className="space-y-1.5">
            <Label>Fumatore</Label>
            <Select value={smoker ? "si" : "no"} onValueChange={(v) => setSmoker(v === "si")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="si">Sì</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tetracicline</Label>
            <Select value={tetra ? "si" : "no"} onValueChange={(v) => setTetra(v === "si")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="si">Sì</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.section>


      {/* ── BIG SIMULATION HERO ── */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="svp-card mt-5 overflow-hidden p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">Simulazione prima / dopo</h3>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Carica una foto del sorriso del paziente: a sinistra lo stato attuale, a destra l'effetto whitening previsto.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground hover:opacity-90"
            >
              <Upload className="h-3.5 w-3.5" /> {photo ? "Sostituisci foto" : "Carica foto"}
            </button>
            <CameraCaptureButton
              buttonLabel={photo ? "Scatta nuova foto" : "Scatta selfie"}
              dialogTitle="Scatta la foto del sorriso"
              dialogDescription="Apri la fotocamera del dispositivo e acquisisci direttamente l'immagine da usare nella simulazione."
              facingMode="user"
              onCapture={onCapturedPhoto}
              onFallback={() => fileRef.current?.click()}
              className="rounded-full px-4 py-2 text-[12px] font-medium"
            />
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onPhoto(e.target.files[0])} />
        </div>

        {photo ? (
          <BeforeAfterSlider beforeSrc={photo} sameSource intensity={0.75} />
        ) : (
          <div className="grid min-h-[360px] place-items-center rounded-[1.5rem] border-2 border-dashed border-border/80 bg-muted/25 px-6 py-10 text-center">
            <div className="max-w-md">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-muted text-primary">
                <Camera className="h-7 w-7" />
              </div>
              <h4 className="mt-4 font-display text-[22px] font-semibold text-foreground">Carica la foto del sorriso</h4>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                Nessuna immagine preimpostata: la simulazione si genera solo sulla foto reale che carichi o scatti adesso.
              </p>
            </div>
          </div>
        )}

        <p className="mt-3 text-[11px] text-muted-foreground">
          L'effetto whitening è elaborato sulla stessa fotografia caricata e ha finalità illustrative. Non rappresenta garanzia di risultato clinico.
        </p>
      </motion.section>

      {/* ── PROTOCOLLO ── */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="svp-card mt-5 overflow-hidden">
        <div className="flex items-center justify-between bg-primary px-5 py-3 text-primary-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <h3 className="font-display text-[15px] font-semibold">Protocollo generato</h3>
          </div>
          {protocol && (
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {protocol.id} · {protocol.predicibilita}
            </span>
          )}
        </div>

        {!protocol ? (
          <div className="flex items-center gap-3 p-5 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Protocollo non disponibile per questa combinazione
          </div>
        ) : (
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <ProtoBlock title="Protocollo studio" body={protocol.protocolStudio} />
            <ProtoBlock title="Protocollo domiciliare" body={protocol.protocolHome} />
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sedute previste</div>
              <div className="font-display text-xl font-semibold text-foreground">{protocol.sedute}</div>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Predicibilità</div>
              <div className="font-display text-xl font-semibold text-foreground">{protocol.predicibilita}</div>
            </div>
            {protocol.alert && (
              <div className="md:col-span-2 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[12px] text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{protocol.alert}</span>
              </div>
            )}
            <div className="md:col-span-2 flex gap-2 pt-1">
              <Button onClick={save} className="flex-1 rounded-full">
                <Save className="mr-1.5 h-4 w-4" /> Salva caso
              </Button>
              <Button onClick={exportPdf} variant="outline" className="flex-1 rounded-full" disabled={exporting}>
                <FileDown className="mr-1.5 h-4 w-4" /> {exporting ? "Generazione PDF..." : "Esporta PDF"}
              </Button>
            </div>
          </div>
        )}
      </motion.section>


      <NewPatientDialog
        open={openNew}
        onOpenChange={(v) => { setOpenNew(v); if (!v) setPrefillName(undefined); }}
        prefillName={prefillName}
        onCreated={(p) => onSelectPatient(p.id)}
      />

      {selected && pdfCase && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "794px",
            zIndex: -1,
            opacity: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <CasePdfTemplate ref={pdfRef} patient={selected} caseData={pdfCase} />
        </div>
      )}

      <Dialog open={!!previewPdf} onOpenChange={(v) => { if (!v) closePreview(); }}>
        <DialogContent className="max-w-4xl p-0 sm:rounded-2xl overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-3">
            <DialogTitle className="font-display text-xl">Anteprima PDF</DialogTitle>
            <DialogDescription className="truncate">
              {previewPdf?.filename ?? ""}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/40 px-4">
            {previewPdf && (
              <iframe
                src={previewPdf.url}
                title={previewPdf.filename}
                className="h-[65vh] w-full rounded-lg border border-border bg-white"
              />
            )}
          </div>
          <DialogFooter className="gap-2 px-6 py-4">
            <Button variant="outline" className="rounded-full" onClick={closePreview}>
              Annulla
            </Button>
            <Button className="rounded-full" onClick={confirmDownload}>
              <FileDown className="mr-1.5 h-4 w-4" /> Scarica PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function ProtoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
      <p className="mt-1 text-[13px] leading-relaxed text-foreground">{body}</p>
    </div>
  );
}
