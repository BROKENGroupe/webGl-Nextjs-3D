"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

export const LogoutButton = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-500 transition-all hover:bg-red-500 hover:text-white"
    >
      <LogOut className="h-4 w-4" />
      <span>Cerrar Sesión</span>
    </button>
  );
};
