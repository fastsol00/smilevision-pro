export type ShadeColor = "B1" | "A1" | "B2" | "A2" | "A3";
export const SHADES: ShadeColor[] = ["B1", "B2", "A1", "A2", "A3"];

export type Sensitivity = "Assente" | "Lieve" | "Moderata" | "Alta";
export const SENSITIVITIES: Sensitivity[] = ["Assente", "Lieve", "Moderata", "Alta"];

export type Predicibilita = "Alta" | "Media" | "Bassa";

export interface ProtocolRule {
  id: string;
  targetShade: ShadeColor;
  smoker: boolean;
  sensitivity: Sensitivity;
  tetracycline: boolean;
  protocolStudio: string;
  protocolHome: string;
  sedute: number;
  predicibilita: Predicibilita;
  alert: string;
}

export type CoffeeTea = "none" | "low" | "moderate" | "high";

export interface Lifestyle {
  coffeeTea: CoffeeTea;
  bruxism: boolean;
  redWine: boolean;
  sportsDrinks: boolean;
  poorOralHygiene: boolean;
  refluxAcidDiet?: boolean;
  dentalRestorations?: boolean;
  xerostomia?: boolean;
}

export const DEFAULT_LIFESTYLE: Lifestyle = {
  coffeeTea: "none",
  bruxism: false,
  redWine: false,
  sportsDrinks: false,
  poorOralHygiene: false,
  refluxAcidDiet: false,
  dentalRestorations: false,
  xerostomia: false,
};

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  age?: number;
  email?: string;
  phone?: string;
  notes?: string;
  smoker: boolean;
  tetracycline: boolean;
  sensitivity: Sensitivity;
  targetShade: ShadeColor;
  lifestyle?: Lifestyle;
  membership?: "Premier" | "Standard";
  hygieneScore?: number;
  createdAt: string;
  lastVisit?: string;
}

export interface ClinicalCase {
  id: string;
  patientId: string;
  createdAt: string;
  targetShade: ShadeColor;
  smoker: boolean;
  sensitivity: Sensitivity;
  tetracycline: boolean;
  photo?: string; // base64 data url
  protocolStudio: string;
  protocolHome: string;
  sedute: number;
  predicibilita: Predicibilita;
  alert: string;
  professionalNotes?: string;
  pdfName?: string;
}
