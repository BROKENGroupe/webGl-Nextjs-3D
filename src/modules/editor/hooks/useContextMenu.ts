import { useState } from "react";

export function useContextMenu() {
  const [menu, setMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  function openMenu(x: number, y: number) {
    setMenu({ x, y, visible: true });
  }
  function closeMenu() {
    setMenu({ ...menu, visible: false });
  }

  return { menu, openMenu, closeMenu };
}