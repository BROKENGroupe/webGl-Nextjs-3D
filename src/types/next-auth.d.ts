import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      image: any;
      registrationComplete?: boolean;
      role?: string;
      permissions?: Record<string, boolean>;
    } & DefaultSession["user"];
    workspace?: {
      id: string;
      name: string;
      slug: string;
      accountType: string;
      enabledModules: string[];
    };
    accessToken?: string;
    refreshToken?: string;
    isNewUser?: boolean;
  }

  interface User extends DefaultUser {
    registrationComplete?: boolean;
    role?: string;
    permissions?: Record<string, boolean>;
    workspaceId?: string;
    workspaceName?: string;
    members?: any[];
    settings?: any;
    metadata?: any;
    slug?: string;
    accountType?: string;
    enabledModules?: string[];
    accessToken?: string;
    refreshToken?: string;
  }

  interface JWT {
    registrationComplete?: boolean;
    isNewUser?: boolean;
    role?: string;
    permissions?: Record<string, boolean>;
    workspaceId?: string;
    workspaceName?: string;
    slug?: string;
    accountType?: string;
    enabledModules?: string[];
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}
