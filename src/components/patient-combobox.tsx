import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, BadgeCheck, UserPlus } from "lucide-react";
import type { Patient } from "@/lib/types";

interface Props {
  patients: Patient[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreateNew: (suggestedName?: string) => void;
  placeholder?: string;
}

export function PatientCombobox({ patients, selectedId, onSelect, onCreateNew, placeholder }: Props) {
  const selected = patients.find((p) => p.id === selectedId);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedLabel = useMemo(
    () => (selected ? `${selected.firstName} ${selected.lastName}` : ""),
    [selected],
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!open && q !== selectedLabel) setQ(selectedLabel);
  }, [open, q, selectedLabel]);

  const filtered = patients.filter((p) =>
    !q || `${p.firstName} ${p.lastName}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div ref={rootRef} className="relative w-full">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => { setOpen(true); if (selected) setQ(""); }}
        placeholder={placeholder ?? "Cerca paziente per nome…"}
        className="h-11 w-full rounded-full border border-border/70 bg-card pl-10 pr-4 text-sm font-medium text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
      />

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl ring-1 ring-black/[0.02]">
          <ul className="max-h-72 overflow-y-auto py-1.5">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-[13px] text-muted-foreground">Nessun paziente trovato.</li>
            )}
            {filtered.map((p) => {
              const active = p.id === selectedId;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => { onSelect(p.id); setQ(`${p.firstName} ${p.lastName}`); setOpen(false); }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-muted/60 ${active ? "bg-[var(--color-medical-soft)]" : ""}`}
                  >
                    <div className="relative shrink-0">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-[12px] font-semibold text-primary ring-1 ring-border/50">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      {p.membership === "Premier" && (
                        <span className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-emerald-500 ring-2 ring-card">
                          <BadgeCheck className="h-2 w-2 text-white" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-foreground">{p.firstName} {p.lastName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        ID SV-{p.id.toUpperCase()} · Target {p.targetShade}
                      </div>
                    </div>
                    {active && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                        Attivo
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => { setOpen(false); onCreateNew(q.trim() || undefined); }}
            className="flex w-full items-center gap-2.5 border-t border-border/60 bg-muted/40 px-4 py-3 text-left text-[13px] font-medium text-foreground transition hover:bg-muted"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
              <UserPlus className="h-3.5 w-3.5" />
            </span>
            {q.trim()
              ? <>Aggiungi nuovo paziente <span className="text-primary">«{q.trim()}»</span></>
              : <>Aggiungi nuovo paziente</>}
            <Plus className="ml-auto h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
