"use client";

import { useState, ReactNode } from "react";
import { AuthContext, AuthContextType } from "@/context/AuthContext";
import { User } from "@/app/auth/types";

const MOCK_USER: User = {
  id: "dev-123",
  username: "Desarrollador",
  email: "dev@test.com",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User, token: string) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const devLogin = () => {
    console.log("Modo desarrollador: Iniciando sesión con usuario falso.");
    setUser(MOCK_USER);
  };

  const authContextValue: AuthContextType = {
    user,
    login,
    logout,
    devLogin,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
