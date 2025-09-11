import { User } from "@/app/auth/types";
import { CreateUserDto } from "@/app/auth/types/user";
import api from "@/_lib/axios";
import { LoginDto } from "@/app/auth/types/login";

type LoginResponse = {
  accessToken: string;
};

export const loginUser = (credentials: LoginDto) => {
  return api.post<LoginResponse>("/auth/login", credentials);
};

export const registerUser = (userData: CreateUserDto) => {
  return api.post<User>("/auth/register", userData);
};
export const getProfile = (token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return api.get<User>("/auth/profile", { headers });
};

export const forgotPassword = (email: string) => {
  return api.post("/auth/forgot-password", { email });
};

export const resetPassword = (token: string, password: string) => {
  return api.post(`/auth/reset-password/${token}`, { password });
};

export const getGoogleAuthUrl = (): string => {
  return "http://localhost:3001/auth/google";
};
