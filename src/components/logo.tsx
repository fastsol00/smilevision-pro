import { SmilePlus } from "lucide-react";

export function Logo({ className = "", showSubtitle = false }: { className?: string; showSubtitle?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <SmilePlus className="h-4 w-4" />
      </div>
      <div className="leading-tight">
        <div className="font-display text-[15px] font-semibold tracking-tight text-foreground">SmileVision <span className="text-primary/70">PRO</span></div>
        {showSubtitle && <div className="text-[11px] text-muted-foreground">Dr. Antonio Mirone · Igienista Dentale</div>}
      </div>
    </div>
  );
}
