import type { JWT } from "next-auth/jwt";
import type { User } from "next-auth";

export interface MappedUser {
  // Datos del usuario
  id: string | null;
  email: string | null;
  name: string | null;
  image: string | null;
  role: string | null;
  permissions: string[] | null;
  
  // Datos del workspace
  workspaceId: string | null;
  workspaceName: string | null;
  slug: string | null;
  accountType: string | null;
  enabledModules: string[] | null;
  members: any[] | null;
  settings: any | null;
  metadata: any | null;
  
  // Tokens
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * Normaliza datos de usuario de cualquier provider (Google, Credentials, etc.)
 * Ahora maneja la estructura separada de user y workspace
 */
export function mapUserToToken(user: Partial<User>, account?: any): MappedUser {
  return {
    // Datos del usuario
    id: (user as any).id ?? null,
    email: user.email ?? null,
    name: user.name ?? null,
    image: (user as any).image ?? null,
    role: (user as any).role ?? null,
    permissions: (user as any).permissions ?? null,
    
    // Datos del workspace
    workspaceId: (user as any).workspaceId ?? null,
    workspaceName: (user as any).workspaceName ?? null,
    slug: (user as any).slug ?? (user as any).tenantSlug ?? null,
    accountType: (user as any).accountType ?? null,
    enabledModules: (user as any).enabledModules ?? null,
    members: (user as any).members ?? null,
    settings: (user as any).settings ?? null,
    metadata: (user as any).metadata ?? null,
    
    // Tokens
    accessToken: (user as any).accessToken || account?.access_token || null,
    refreshToken: (user as any).refreshToken || null,
  };
}

/**
 * Normaliza los datos del token hacia la sesión del frontend
 * Ahora incluye datos del workspace en la sesión
 */
export function mapTokenToSession(token: JWT, session: any) {
  // Datos del usuario
  session.user.id = (token as any).id ?? null;
  session.user.email = token.email ?? null;
  session.user.name = token.name ?? null;
  session.user.image = (token as any).image ?? null;
  session.user.role = (token as any).role ?? null;
  session.user.permissions = (token as any).permissions ?? null;

  // Datos del workspace
  session.workspace = {
    id: (token as any).workspaceId ?? null,
    name: (token as any).workspaceName ?? null,
    slug: (token as any).slug ?? null,
    accountType: (token as any).accountType ?? null,
    enabledModules: (token as any).enabledModules ?? null,
    members: (token as any).members ?? null,
    settings: (token as any).settings ?? null,
    metadata: (token as any).metadata ?? null,
  };

  // Tokens y otros datos de sesión
  session.accessToken = (token as any).accessToken ?? null;
  session.refreshToken = (token as any).refreshToken ?? null;
  session.error = (token as any).error ?? null;

  // Mantener slug en el nivel raíz para compatibilidad
  session.slug = (token as any).slug ?? null;

  return session;
}

/**
 * Helper para extraer datos del workspace de la sesión
 */
export function getWorkspaceFromSession(session: any) {
  return session?.workspace ?? {
    id: null,
    name: null,
    slug: null,
    accountType: null,
    enabledModules: null,
    members: null,
    settings: null,
    metadata: null,
  };
}

/**
 * Helper para verificar si el usuario tiene permisos específicos
 */
export function hasPermission(session: any, permission: string): boolean {
  const permissions = session?.user?.permissions ?? [];
  return permissions.includes(permission);
}

/**
 * Helper para verificar si un módulo está habilitado en el workspace
 */
export function isModuleEnabled(session: any, moduleName: string): boolean {
  const enabledModules = session?.workspace?.enabledModules ?? [];
  return enabledModules.includes(moduleName);
}
