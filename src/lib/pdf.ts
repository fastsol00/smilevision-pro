import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import type { Patient, ClinicalCase } from "./types";

export type GeneratedPdf = {
  filename: string;
  blob: Blob;
  url: string;
  /** The underlying jsPDF instance — used for the most reliable cross-browser download via .save() */
  pdf: jsPDF;
};

async function waitForImages(el: HTMLElement) {
  const imgs = Array.from(el.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) return resolve();
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );
  // Give the layout one extra frame to settle (fonts, flex/grid measurements)
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function buildFilename(patient: Patient): string {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return `SmileVision_PRO_${safe(patient.firstName) || "Paziente"}_${safe(patient.lastName) || "SenzaCognome"}_${date}.pdf`;
}

/**
 * Renders the given DOM element to a multi-page A4 PDF.
 * Returns the jsPDF instance, a Blob, and an object URL for previewing in an iframe.
 * The caller is responsible for revoking the object URL when done.
 */
export async function generateCasePdfFromElement(
  element: HTMLElement,
  patient: Patient,
  _c: ClinicalCase,
): Promise<GeneratedPdf> {
  if (!element || element.offsetWidth === 0) {
    throw new Error("Template PDF non disponibile o non renderizzato");
  }

  await waitForImages(element);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    allowTaint: true,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error("Snapshot del template fallito (canvas vuoto)");
  }

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
  heightLeft -= pageH;

  while (heightLeft > 0) {
    position = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pageH;
  }

  const filename = buildFilename(patient);
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);

  return { filename, blob, url, pdf };
}

/**
 * Trigger a real file download using jsPDF.save() — the most reliable
 * cross-browser path (handles Chrome, Firefox, Safari, Edge).
 */
export function downloadPdf(generated: GeneratedPdf) {
  generated.pdf.save(generated.filename);
}
