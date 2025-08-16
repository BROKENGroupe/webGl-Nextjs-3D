"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

type CollapsibleAsideProps = {
  side: "left" | "right";
  children: ReactNode;
  className?: string;
};

export function CollapsibleAside({ side, children, className }: CollapsibleAsideProps) {
  const [open, setOpen] = useState(false);

  // Posiciones para el aside flotante
  const desktopPosition =
    side === "left"
      ? "left-0 top-15 h-full"
      : "right-0 top-15 h-full";

  const buttonPosition =
    side === "left"
      ? "left-2"
      : "right-2";

  // Animación: translate-x para entrada/salida
  const panelAnimation = open
    ? "translate-x-0 opacity-100"
    : side === "left"
      ? "-translate-x-full opacity-0"
      : "translate-x-full opacity-0";

  return (
    <>
      {/* Móvil: Sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`fixed top-20 z-40 ${buttonPosition}`}
            >
              {side === "left" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </Button>
          </SheetTrigger>
          <SheetContent side={side} className="w-72 p-0">
            {children}
          </SheetContent>
        </Sheet>
      </div>
      {/* Escritorio: aside flotante animado */}
      <div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen((v) => !v)}
          className={`hidden md:flex fixed top-20 z-50 ${buttonPosition}`}
          aria-label={open ? "Ocultar panel" : "Mostrar panel"}
        >
          {side === "left"
            ? open
              ? <ChevronLeftIcon />
              : <ChevronRightIcon />
            : open
              ? <ChevronRightIcon />
              : <ChevronLeftIcon />}
        </Button>
        <div
          className={`
            hidden md:block fixed z-40 bg-background/95 shadow-lg
            w-80 h-full p-4
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