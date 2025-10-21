"use client";

import { Sheet, SheetContent } from "@/shared/ui/sheet";
import { ChevronRightIcon } from "lucide-react";
import { ReactNode } from "react";

type CollapsibleAsideProps = {
  side: "left" | "right";
  children: ReactNode;
  className?: string;
  open: boolean; // <-- control externo
  onClose?: () => void; // <-- callback para cerrar
};

export function CollapsibleAsideTrigger({
  side,
  children,
  className,
  open,
  onClose,
}: CollapsibleAsideProps) {
  // Posiciones para el aside flotante
  const desktopPosition =
    side === "left" ? "left-0 top-15 h-full" : "right-0 top-15 h-full";

  // Animación: translate-x para entrada/salida
  const panelAnimation = open
    ? "translate-x-0 opacity-100"
    : side === "left"
    ? "-translate-x-full opacity-0"
    : "translate-x-full opacity-0";

  return (
    <>
      {/* Escritorio: aside flotante animado */}
      <div>
        <div
          className={`
            hidden md:block fixed z-999 bg-background/95 shadow-lg
            w-100 h-full p-4
            transition-all duration-300 ease-in-out
            ${desktopPosition}
            ${panelAnimation}
            ${className ?? ""}
          `}
          style={{
            backdropFilter: "blur(8px)",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
