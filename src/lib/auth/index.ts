/**
 * Auth scaffolding — multi-utente / ruoli.
 * Per ora restituisce un utente demo. Sostituire con sessione Supabase
 * quando l'auth verrà attivata.
 */
export type Role = "admin" | "hygienist" | "assistant";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  clinicId: string;
}

export function getCurrentUser(): SessionUser {
  return {
    id: "demo-user",
    email: "antonio.mirone@smilevision.pro",
    fullName: "Dr. Antonio Mirone",
    role: "hygienist",
    clinicId: "demo-clinic",
  };
}

export function hasRole(user: SessionUser, role: Role): boolean {
  if (user.role === "admin") return true;
  return user.role === role;
}
