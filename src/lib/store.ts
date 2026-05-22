import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Patient, ClinicalCase } from "./types";

interface State {
  patients: Patient[];
  cases: ClinicalCase[];
  addPatient: (p: Omit<Patient, "id" | "createdAt">) => Patient;
  updatePatient: (id: string, patch: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  addCase: (c: Omit<ClinicalCase, "id" | "createdAt">) => ClinicalCase;
  deleteCase: (id: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

function createSamplePatient(): Patient {
  return {
    id: "sample-elena-vance",
    firstName: "Elena",
    lastName: "Vance",
    age: 34,
    email: "elena.vance@example.com",
    phone: "+39 333 1122 880",
    notes: "Paziente molto attenta all'estetica. Routine di igiene domiciliare buona, due caffè al giorno e bruxismo notturno con bite.",
    smoker: false,
    tetracycline: false,
    sensitivity: "Lieve",
    targetShade: "B1",
    membership: "Premier",
    hygieneScore: 94,
    lifestyle: {
      coffeeTea: "moderate",
      bruxism: true,
      redWine: false,
      sportsDrinks: false,
      poorOralHygiene: false,
    },
    createdAt: "2026-05-21T09:30:00.000Z",
  };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      patients: [createSamplePatient()],
      cases: [],
      addPatient: (p) => {
        const patient: Patient = { ...p, id: uid(), createdAt: new Date().toISOString() };
        set({ patients: [patient, ...get().patients] });
        return patient;
      },
      updatePatient: (id, patch) =>
        set({ patients: get().patients.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),
      deletePatient: (id) =>
        set({
          patients: get().patients.filter((p) => p.id !== id),
          cases: get().cases.filter((c) => c.patientId !== id),
        }),
      addCase: (c) => {
        const cs: ClinicalCase = { ...c, id: uid(), createdAt: new Date().toISOString() };
        set({ cases: [cs, ...get().cases] });
        // touch patient last visit
        set({
          patients: get().patients.map((p) =>
            p.id === c.patientId ? { ...p, lastVisit: cs.createdAt } : p,
          ),
        });
        return cs;
      },
      deleteCase: (id) => set({ cases: get().cases.filter((c) => c.id !== id) }),
    }),
    {
      name: "smilevision-pro:v2",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : (undefined as unknown as Storage),
      ),
      skipHydration: true,
    },
  ),
);

export function patientCases(patientId: string) {
  return useStore.getState().cases.filter((c) => c.patientId === patientId);
}

export function seedSampleIfEmpty() {
  const s = useStore.getState();
  if (s.patients.length > 0) return;
  useStore.setState({ patients: [createSamplePatient()] });
}

