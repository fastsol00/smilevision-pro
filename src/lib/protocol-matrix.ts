/**
 * Matrice decisionale per protocollo di sbiancamento.
 * Generata algoritmicamente; in produzione può essere caricata da Excel/JSON
 * tramite import dinamico, mantenendo la stessa shape ProtocolRule[].
 */
import type { ProtocolRule, ShadeColor, Sensitivity, Predicibilita } from "./types";
import { SHADES, SENSITIVITIES } from "./types";

function buildMatrix(): ProtocolRule[] {
  const out: ProtocolRule[] = [];
  let i = 1;
  for (const shade of SHADES) {
    for (const smoker of [false, true]) {
      for (const sens of SENSITIVITIES) {
        for (const tetra of [false, true]) {
          const shadeIdx = SHADES.indexOf(shade); // 0=B1 più chiaro
          const baseSedute = 2 + shadeIdx + (smoker ? 1 : 0) + (tetra ? 2 : 0);

          let studio = "Sbiancamento professionale in studio con perossido di idrogeno 35% — 2 applicazioni da 15 min con lampada LED.";
          let home = "Mascherine personalizzate con perossido di carbammide 16% — 30 min/die per 14 giorni.";
          let alert = "";
          let pred: Predicibilita = "Alta";

          if (sens === "Lieve") home = "Mascherine con perossido di carbammide 10% — 45 min/die per 14 giorni. Dentifricio desensibilizzante.";
          if (sens === "Moderata") {
            home = "Mascherine con perossido di carbammide 10% — 30 min/die a giorni alterni per 21 giorni. Pre-trattamento desensibilizzante (nitrato di potassio 5%).";
            studio = "Sbiancamento in studio HP 25% — 2 applicazioni da 10 min. Applicare gel desensibilizzante pre e post.";
            pred = "Media";
          }
          if (sens === "Alta") {
            home = "Solo terapia domiciliare con perossido di carbammide 10% — 20 min/die a giorni alterni per 28 giorni. Desensibilizzante prima di ogni applicazione.";
            studio = "Sbiancamento in studio sconsigliato in prima istanza. Eventuale singola seduta HP 15% di sole 8 min dopo 2 settimane di desensibilizzazione.";
            alert = "Sensibilità alta: monitorare attentamente, sospendere se DPI persistente >24h.";
            pred = "Media";
          }

          if (smoker) {
            alert = (alert ? alert + " " : "") + "Paziente fumatore: risultato condizionato dalle abitudini; consigliata sospensione del fumo durante il trattamento.";
            if (pred === "Alta") pred = "Media";
          }

          if (tetra) {
            alert = (alert ? alert + " " : "") + "Discromia da tetracicline: protocollo prolungato (KöR-like), risultato graduale, predicibilità ridotta.";
            home = "Mascherine notturne con perossido di carbammide 16% — uso notturno (6–8h) per 8 settimane. Controllo bisettimanale.";
            studio = "Sedute combinate: 2 sedute iniziali HP 25% + ciclo domiciliare notturno prolungato.";
            pred = sens === "Alta" ? "Bassa" : "Media";
          }

          if (shadeIdx >= 3 && (tetra || sens === "Alta")) {
            pred = "Bassa";
            alert = (alert ? alert + " " : "") + "Target chiaro difficile da raggiungere in questo profilo clinico.";
          }

          out.push({
            id: `R${String(i).padStart(3, "0")}`,
            targetShade: shade,
            smoker,
            sensitivity: sens,
            tetracycline: tetra,
            protocolStudio: studio,
            protocolHome: home,
            sedute: baseSedute,
            predicibilita: pred,
            alert: alert.trim(),
          });
          i++;
        }
      }
    }
  }
  return out;
}

export const PROTOCOL_MATRIX: ProtocolRule[] = buildMatrix();

export function findProtocol(params: {
  targetShade: ShadeColor;
  smoker: boolean;
  sensitivity: Sensitivity;
  tetracycline: boolean;
}): ProtocolRule | null {
  return (
    PROTOCOL_MATRIX.find(
      (r) =>
        r.targetShade === params.targetShade &&
        r.smoker === params.smoker &&
        r.sensitivity === params.sensitivity &&
        r.tetracycline === params.tetracycline,
    ) ?? null
  );
}
