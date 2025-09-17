import { useContext } from "react";
import { AuthContext, AuthContextType } from "@/context/AuthContext";
import { useSession } from "next-auth/react";

export const useAuth = (): any => {
  const { data: session } = useSession();
  if (!session) {
    throw new Error("useAuth not found in AuthProvider");
  }
  return session;
};
