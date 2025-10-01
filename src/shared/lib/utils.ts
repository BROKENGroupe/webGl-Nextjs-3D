import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidTenant(tenantId: string) {
  // Simula tu lógica: compara con una lista, consulta API, etc.
  const validTenants = ["insonor", "arquitectura", "demo", "david-velez"];
  return validTenants.includes(tenantId);
}
