import type { JWT } from "next-auth/jwt";
import type { User } from "next-auth";

export interface MappedUser {
  id: string | null;
  email: string | null;
  name: string | null;
  image: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  permissions: string[] | null;
  slug: string | null;
}

/**
 * Normaliza datos de usuario de cualquier provider (Google, Credentials, etc.)
 */
export function mapUserToToken(user: Partial<User>, account?: any): MappedUser {
  return {
    id: (user as any).id ?? null,
    email: user.email ?? null,
    name: user.name ?? null,
    image: (user as any).image ?? null,
    accessToken: (user as any).accessToken || account?.access_token || null,
    refreshToken: (user as any).refreshToken || null,
    permissions: (user as any).permissions ?? null,
    slug: (user as any).tenantSlug ?? null,
  };
}

/**
 * Normaliza los datos del token hacia la sesión del frontend
 */
export function mapTokenToSession(token: JWT, session: any) {
  session.user.id = (token as any).id ?? null;
  session.user.email = token.email ?? null;
  session.user.name = token.name ?? null;
  session.user.image = (token as any).image ?? null;

  session.accessToken = (token as any).accessToken ?? null;
  session.refreshToken = (token as any).refreshToken ?? null;
  session.permissions = (token as any).permissions ?? null;
  session.error = (token as any).error ?? null;

  return session;
}
