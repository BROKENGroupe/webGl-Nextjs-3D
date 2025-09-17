import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      permissions?: string[] | null;
      image?: { src: string; width?: number; height?: number };
    } & DefaultSession["user"];
    accessToken?: string | null;
    refreshToken?: string | null;
    error?: string | null;
  }

  interface User extends DefaultUser {
    id: string;
    accessToken?: string;
    refreshToken?: string;
    permissions?: string[] | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    permissions?: string[] | null;
    accessTokenExpires?: number;
    error?: string;
  }
}
