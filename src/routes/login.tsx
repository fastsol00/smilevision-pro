import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { useAuthStore } from "@/lib/auth";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const nav = useNavigate();
  const userEmail = useAuthStore((state) => state.user.email);
  const validateCredentials = useAuthStore((state) => state.validateCredentials);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCredentials(email, password)) {
      toast.error("Email o password non corrette.");
      return;
    }
    nav({ to: "/app/patients" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[oklch(0.97_0.01_240)] via-[oklch(0.96_0.012_235)] to-[oklch(0.94_0.02_230)]">
      {/* Subtle grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
        <Logo />
        <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Torna al sito
        </Link>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-100px)] items-center justify-center px-5 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-xl rounded-[2rem] bg-card px-7 py-10 shadow-[0_30px_80px_-30px_rgba(2,8,23,0.18)] ring-1 ring-black/[0.03] md:px-10 md:py-12"
        >
          <div className="text-center">
            <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">SmileVision PRO</div>
            <h1 className="mt-3 font-display text-[34px] font-semibold tracking-tight text-foreground">Bentornato</h1>
            <p className="mt-2 text-[14px] text-muted-foreground">Accedi alla tua area clinica SmileVision Pro.</p>
          </div>

          <form onSubmit={submit} className="mt-9 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground">Indirizzo email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={userEmail}
                className="h-12 w-full rounded-full bg-muted/60 px-5 text-[14px] text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:bg-muted/80 focus:ring-2 focus:ring-ring/30"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-foreground">Password</label>
                <button type="button" className="text-[12px] font-medium text-muted-foreground hover:text-primary">Password dimenticata?</button>
              </div>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-full bg-muted/60 px-5 pr-12 text-[14px] text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:bg-muted/80 focus:ring-2 focus:ring-ring/30"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Nascondi password" : "Mostra password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-[14px] font-semibold text-primary-foreground transition hover:opacity-95"
            >
              Accedi <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </form>

          <div className="my-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
            <span className="h-px flex-1 bg-border" />
            Accesso protetto
            <span className="h-px flex-1 bg-border" />
          </div>
        </motion.div>
      </main>

      {/* Trust badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-6 right-6 hidden items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-xl ring-1 ring-black/[0.04] md:flex"
      >
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="text-[12px] font-semibold text-foreground">Crittografia AES a 256 bit</div>
          <div className="text-[11px] text-muted-foreground">I dati dei pazienti restano riservati e protetti.</div>
        </div>
      </motion.div>

      <footer className="relative z-10 pb-6 text-center text-[11px] text-muted-foreground">
        <div className="mb-2 flex items-center justify-center gap-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
          <span>Privacy</span>
          <span>Conformità</span>
          <span>Supporto</span>
        </div>
        © 2026 SmileVision PRO. Tutti i diritti riservati.
      </footer>
    </div>
  );
}
