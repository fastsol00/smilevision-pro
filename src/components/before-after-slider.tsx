import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  beforeSrc: string;
  afterSrc?: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** If true (or afterSrc omitted), uses the same source as before with a whitening CSS filter applied to the "after" side */
  sameSource?: boolean;
  /** Whitening intensity from 0 to 1, default 0.6 */
  intensity?: number;
}

/**
 * Before/After slider that overlays two pixel-aligned copies of the same image
 * and reveals the "after" via clip-path. This avoids the duplicated-face look
 * that happens when the after image is rendered inside a narrower container.
 */
export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Prima",
  afterLabel = "Dopo",
  sameSource,
  intensity = 0.6,
}: Props) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const useSame = sameSource || !afterSrc;
  const realAfter = useSame ? beforeSrc : afterSrc!;

  const whitenFilter = useSame
    ? `brightness(${1 + 0.16 * intensity}) contrast(${1 + 0.07 * intensity}) saturate(${1 - 0.32 * intensity}) hue-rotate(${-5 * intensity}deg)`
    : undefined;

  const move = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = Math.max(0, Math.min(r.width, clientX - r.left));
    setPos((x / r.width) * 100);
  };

  return (
    <div
      ref={ref}
      className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted select-none cursor-ew-resize"
      onMouseMove={(e) => e.buttons === 1 && move(e.clientX)}
      onMouseDown={(e) => move(e.clientX)}
      onTouchMove={(e) => move(e.touches[0].clientX)}
    >
      {/* Before (full bg) */}
      <img
        src={beforeSrc}
        alt={beforeLabel}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {/* After overlay — identical positioning, revealed via clip-path so it stays pixel-aligned with the before image */}
      <img
        src={realAfter}
        alt={afterLabel}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          filter: whitenFilter,
          clipPath: `inset(0 0 0 ${pos}%)`,
          WebkitClipPath: `inset(0 0 0 ${pos}%)`,
        }}
        draggable={false}
      />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium tracking-wider text-white uppercase">{beforeLabel}</div>
      <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-medium tracking-wider text-primary uppercase">{afterLabel}</div>
      <motion.div className="pointer-events-none absolute top-0 bottom-0 w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)]" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white shadow-lg ring-1 ring-black/5">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary"><path fill="currentColor" d="M9 7l-5 5 5 5V7zm6 0v10l5-5-5-5z"/></svg>
        </div>
      </motion.div>
    </div>
  );
}
