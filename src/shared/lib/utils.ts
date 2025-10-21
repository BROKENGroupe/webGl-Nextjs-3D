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

export const predefinedColors = [
  { name: "Negro", value: "#000000" },
  { name: "Gris", value: "#6b7280" },
  { name: "Rojo", value: "#ef4444" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Amarillo", value: "#f59e0b" },
];
