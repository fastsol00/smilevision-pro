import type { ShadeColor } from "./types";

const SHADE_ORDER: ShadeColor[] = ["B1", "B2", "A1", "A2", "A3"];

export function getShadeWhiteningIntensity(shade: ShadeColor): number {
  const index = SHADE_ORDER.indexOf(shade);
  const clampedIndex = index === -1 ? SHADE_ORDER.length - 1 : index;

  return [1, 0.86, 0.72, 0.58, 0.44][clampedIndex];
}

export function getWhiteningFilter(intensity: number): string {
  const safeIntensity = Math.max(0, Math.min(1, intensity));

  return [
    `brightness(${1 + 0.22 * safeIntensity})`,
    `contrast(${1 + 0.085 * safeIntensity})`,
    `saturate(${1 - 0.34 * safeIntensity})`,
    `hue-rotate(${-6 * safeIntensity}deg)`,
  ].join(" ");
}
