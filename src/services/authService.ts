import { User } from "@/app/auth/types";
import axios, { AxiosResponse } from "axios";

type LoginCredentials = Pick<User, "email"> & { password: string };
type RegisterData = Pick<User, "username" | "email"> & { password: string };

interface AuthResponse {
  user: User;
  token: string;
}

const apiClient = axios.create({
  baseURL: "", // TODO
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginUser = (
  credentials: LoginCredentials
): Promise<AxiosResponse<AuthResponse>> => {
  return apiClient.post("/auth/login", credentials);
};

export const registerUser = (
  userData: RegisterData
): Promise<AxiosResponse<void>> => {
  return apiClient.post("/auth/register", userData);
};

export const forgotPassword = (email: string): Promise<AxiosResponse<void>> => {
  return apiClient.post("/auth/forgot-password", { email });
};

export const resetPassword = (
  token: string,
  password: string
): Promise<AxiosResponse<void>> => {
  return apiClient.post(`/auth/reset-password/${token}`, { password });
};
export const getGoogleAuthUrl = (): string => {
  return "https://api.tu-backend.com/auth/google";
};
