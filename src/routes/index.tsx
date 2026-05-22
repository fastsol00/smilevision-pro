import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, FileText, Activity } from "lucide-react";
import heroDoctor from "@/assets/hero-doctor.jpg";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[oklch(0.96_0.005_240)] px-3 py-4 md:px-10 md:py-10">
      {/* HERO card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-card shadow-[0_30px_80px_-30px_rgba(2,8,23,0.18)] md:rounded-[2.5rem] md:grid-cols-[1.05fr_1fr]"
      >
        {/* LEFT */}
        <div className="relative flex flex-col p-5 md:p-12">
          <div className="flex items-center justify-between">
            <Logo />
          </div>


          <div className="mt-10 md:mt-20">
            <h1 className="font-display text-[34px] leading-[1.05] tracking-[-0.02em] text-primary sm:text-[40px] md:text-[64px]">
              Avere cura del<br />
              <span className="font-serif italic font-medium" style={{ fontFamily: "'Instrument Serif', 'Hanken Grotesk', serif" }}>
                Tuo Sorriso,
              </span><br />
              una visita alla volta.
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/try"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Prova ora <ArrowUpRight className="h-4 w-4" />
              </Link>
              <span className="text-[11px] text-muted-foreground md:text-xs">Carica il tuo selfie · nessuna registrazione</span>
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="relative m-3 overflow-hidden rounded-[2rem] bg-[oklch(0.92_0.02_230)] md:m-4">
          <img
            src={heroDoctor}
            alt="Dr. Antonio Mirone"
            className="h-full w-full object-cover"
            width={1024}
            height={1280}
          />
          <Link to="/login" className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-[12px] font-medium text-primary shadow-sm backdrop-blur">
            Login <ArrowUpRight className="h-3 w-3" />
          </Link>

          {/* Scrolling smile words under the photo */}
          <div className="absolute inset-x-0 bottom-0 overflow-hidden bg-gradient-to-t from-black/55 via-black/25 to-transparent py-4">
            <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 whitespace-nowrap px-4 font-display text-[14px] tracking-tight text-white/90">
              {Array.from({ length: 2 }).map((_, dup) => (
                <div key={dup} className="flex items-center gap-10">
                  {["Sorriso", "Sbiancamento", "Igiene", "Smalto", "Luminosità", "Estetica", "Freschezza", "Armonia", "Bellezza", "Cura"].map((w) => (
                    <span key={`${dup}-${w}`} className="flex items-center gap-10">
                      <span>{w}</span>
                      <span className="text-white/40">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features strip */}
      <section className="mx-auto mt-10 grid max-w-7xl gap-4 md:grid-cols-3">
        {[
          { icon: Sparkles, t: "Simulazione prima/dopo", d: "Slider whitening realistico per ogni paziente." },
          { icon: Activity, t: "Matrice clinica", d: "Protocollo generato da matrice decisionale." },
          { icon: FileText, t: "PDF clinico", d: "Esportazione cartella e referti in un click." },

        ].map((f, i) => (
          <motion.div
            key={f.t}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="svp-card p-5"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-medical-soft)] text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <div className="mt-4 font-display text-[17px] font-semibold text-foreground">{f.t}</div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-2 text-[12px] text-muted-foreground md:flex-row">
        <div>© 2026 SmileVision PRO — Dr. Antonio Mirone, Igienista Dentale</div>
        <div className="flex items-center gap-5">
          <span>Privacy</span><span>HIPAA</span><span>Supporto</span>
        </div>
      </footer>
    </div>
  );
}
