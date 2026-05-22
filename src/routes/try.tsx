import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Sparkles, MessageCircle, RefreshCcw, ShieldCheck, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CameraCaptureButton } from "@/components/camera-capture-button";
import heroDoctor from "@/assets/hero-doctor.jpg";

export const Route = createFileRoute("/try")({ component: TryPage });

function TryPage() {
  const [photo, setPhoto] = useState<string | undefined>();
  const [contactOpen, setContactOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPhoto = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const onCapturedPhoto = (imageDataUrl: string) => {
    setPhoto(imageDataUrl);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[oklch(0.97_0.008_240)] pb-16">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur md:px-8">
        <Link to="/" className="inline-flex items-center gap-2">
          <Logo />
        </Link>
        <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Indietro
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6 md:pt-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Prova gratuita</div>
          <h1 className="mt-2 font-display text-[30px] font-semibold leading-tight tracking-tight text-foreground md:text-[40px]">
            Scopri il <span className="italic font-serif font-medium" style={{ fontFamily: "'Instrument Serif', serif" }}>tuo sorriso</span> dopo lo sbiancamento
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground md:text-[15px]">
            Carica un selfie del tuo sorriso e visualizza in tempo reale una simulazione realistica del whitening professionale.
          </p>
        </motion.div>

        {/* Upload / preview card */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-7 overflow-hidden rounded-[2rem] bg-card p-4 shadow-[0_30px_80px_-30px_rgba(2,8,23,0.18)] ring-1 ring-black/[0.03] md:p-6"
        >
          {!photo ? (
            <div className="border-2 border-dashed border-border/80 bg-muted/30 px-5 py-10 text-center rounded-3xl">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--color-medical-soft)] text-primary">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-display text-[20px] font-semibold text-foreground">Inizia la simulazione</h2>
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                Per il miglior risultato sorridi mostrando i denti, con luce naturale e a fuoco.
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <CameraCaptureButton
                  buttonLabel="Scatta selfie"
                  dialogTitle="Scatta il selfie"
                  dialogDescription="Funziona sia da smartphone sia da PC/Mac, usando la fotocamera disponibile sul dispositivo."
                  facingMode="user"
                  onCapture={onCapturedPhoto}
                  onFallback={() => fileRef.current?.click()}
                  buttonVariant="default"
                  className="h-12 rounded-full px-6 text-[14px] font-semibold"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border/70 bg-card px-6 text-[14px] font-semibold text-foreground hover:bg-muted/40"
                >
                  <Upload className="h-4 w-4" /> Carica foto
                </button>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">
                Le immagini vengono elaborate solo sul tuo dispositivo. Niente upload sui nostri server.
              </p>
            </div>
          ) : (
            <>
              <BeforeAfterSlider beforeSrc={photo} sameSource intensity={0.8} />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[12px] text-muted-foreground">
                  Trascina lo slider per confrontare prima e dopo.
                </p>
                <div className="flex flex-wrap gap-2">
                  <CameraCaptureButton
                    buttonLabel="Scatta di nuovo"
                    dialogTitle="Aggiorna il selfie"
                    dialogDescription="Scatta una nuova foto per confrontare un'altra simulazione." 
                    facingMode="user"
                    onCapture={onCapturedPhoto}
                    onFallback={() => fileRef.current?.click()}
                    className="rounded-full px-3.5 py-2 text-[12px] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setPhoto(undefined)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3.5 py-2 text-[12px] font-medium text-foreground hover:bg-muted/50"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" /> Rimuovi foto
                  </button>
                </div>
              </div>
            </>
          )}

          <p className="mt-5 px-1 text-center text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Disclaimer clinico.</span> La simulazione ha finalità illustrative e non rappresenta garanzia di risultato clinico.
          </p>

          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onPhoto(e.target.files[0])} />
        </motion.section>

        {/* CTA contatto medico */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-7 overflow-hidden rounded-[2rem] bg-primary p-5 text-primary-foreground sm:p-7 md:p-9"
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-foreground/15">
            <MessageCircle className="h-5 w-5" />
          </div>
          <h3 className="mt-4 whitespace-pre-line font-display text-[22px] font-semibold leading-tight md:text-[26px]">
            Il risultato ti piace?{"\n"}Parlane con il Dr. Antonio Mirone.{"\n"}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-primary-foreground/80">
            Una valutazione clinica personalizzata ti dirà esattamente quale protocollo
            di sbiancamento è più adatto al tuo sorriso, alla tua sensibilità e ai tuoi obiettivi.
          </p>
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-card px-6 text-[14px] font-semibold text-primary transition hover:opacity-95"
          >
            Contatta lo studio <ArrowRight className="h-4 w-4" />
          </button>
        </motion.section>

        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Foto elaborata in locale · nessun dato trasmesso
        </div>

        <p className="mt-3 text-center text-[10px] text-muted-foreground/80">
          L'effetto whitening mostrato è puramente illustrativo e non rappresenta una promessa di risultato clinico.
        </p>
      </main>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
          <div className="grid md:grid-cols-[0.92fr_1.08fr]">
            <div className="relative h-44 bg-muted md:h-auto md:min-h-full">

              <img
                src={heroDoctor}
                alt="Antonio Mirone"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 text-white">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Antonio Mirone</div>
                <div className="mt-1 font-display text-[28px] font-semibold">Studio whitening</div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <DialogHeader className="text-left">
                <DialogTitle className="font-display text-[28px] font-semibold text-foreground">
                  Contatta lo studio
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Se la demo ti interessa, puoi fissare una valutazione con lo studio del Dr. Antonio Mirone.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-muted/40 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Telefono</div>
                  <a href="tel:+390815551234" className="mt-1 block font-display text-[24px] font-semibold text-foreground hover:text-primary">
                    +39 081 555 1234
                  </a>
                </div>
                <div className="rounded-2xl bg-muted/40 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Indirizzo studio</div>
                  <div className="mt-1 text-[15px] font-medium text-foreground">Via Toledo 145, Napoli</div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="tel:+390815551234"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
                  >
                    Chiama ora
                  </a>
                  <a
                    href="mailto:info@studiomirone.it?subject=Richiesta%20consulenza%20whitening"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-border/70 bg-card px-5 text-sm font-semibold text-foreground"
                  >
                    Scrivi email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
