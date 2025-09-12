import { User } from "@/app/auth/types";
import { createContext } from "react";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => void;
  //devLogin: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
