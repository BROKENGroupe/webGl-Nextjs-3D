import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      role?: string;
      permissions?: string[] | null;
      image?: { src: string; width?: number; height?: number };
      createdAt?: string;
      updatedAt?: string;
    } & DefaultSession["user"];
    
    // ✅ Nuevo: Objeto workspace separado
    workspace: {
      id: string | null;
      name: string | null;
      slug: string | null;
      accountType: string | null;
      enabledModules: string[] | null;
      members: any[] | null;
      settings: any | null;
      metadata: any | null;
    };
    
    // Tokens y otros
    accessToken?: string | null;
    refreshToken?: string | null;
    error?: string | null;
    
    // Mantener slug en raíz para compatibilidad
    slug?: string | null;
  }

  interface User extends DefaultUser {
    id: string;
    role?: string;
    permissions?: string[] | null;
    
    // ✅ Campos del workspace en User (para mapeo inicial)
    workspaceId?: string;
    workspaceName?: string;
    slug?: string | null;
    accountType?: string;
    enabledModules?: string[];
    members?: any[];
    settings?: any;
    metadata?: any;
    
    // Tokens
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    // Datos del usuario
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    permissions?: string[] | null;
    image?: string | null;
    
    // ✅ Datos del workspace en JWT
    workspaceId?: string | null;
    workspaceName?: string | null;
    slug?: string | null;
    accountType?: string | null;
    enabledModules?: string[] | null;
    members?: any[] | null;
    settings?: any | null;
    metadata?: any | null;
    
    // Tokens y control
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
