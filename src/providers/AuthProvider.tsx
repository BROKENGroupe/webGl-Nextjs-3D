"use client";

import { useState, ReactNode, useEffect } from "react";
import { AuthContext, AuthContextType } from "@/context/AuthContext";
import { User } from "@/app/auth/types";
import { getProfile } from "@/services/authService";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await getProfile();
          setUser(response.data);
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (accessToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    setCookie("authToken", accessToken, { path: "/" });
    try {
      console.log(
        "AuthProvider: Intentando obtener perfil con el nuevo token..."
      ); // LOG 3
      const profileResponse = await getProfile(accessToken);

      // 👇 ESTE ES EL LOG MÁS IMPORTANTE
      console.log(
        "AuthProvider: Perfil recibido del backend:",
        profileResponse.data
      ); // LOG 4

      setUser(profileResponse.data);
      console.log('AuthProvider: Estado "user" actualizado.'); // LOG 5
    } catch (error) {
      console.error("No se pudo obtener el perfil después del login", error);
      logout();
      throw error;
    }
  };

  // El logout tampoco necesita borrar el refreshToken de localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    deleteCookie("authToken", { path: "/" });
    // El backend se encarga de invalidar la cookie httpOnly en su endpoint /logout
  };

  const authContextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  if (loading) return <p>Cargando sesión...</p>;

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
