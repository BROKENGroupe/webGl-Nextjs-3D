import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { NextAuthOptions } from 'next-auth';
import axios from 'axios';
import { mapTokenToSession, mapUserToToken } from './auth-mapper';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NESTJS_API_URL,
  withCredentials: true
});

const ONE_HOUR = 8 * 60 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { data } = await api.post('/accounts/login', {
            email: credentials?.email,
            password: credentials?.password,
          });

          // Nueva estructura de respuesta con user y workspace separados
          if (data && data.accessToken && data.user && data.workspace) {

            const mapped = mapUserToToken({
              // Datos del usuario
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.image ?? null,
              role: data.user.role,
              permissions: data.user.permissions ?? [],
              registrationComplete: data.user.registrationComplete ?? false,
              // Datos del workspace
              workspaceId: data.workspace.id,
              workspaceName: data.workspace.name,
              slug: data.workspace.slug,
              accountType: data.workspace.accountType,
              enabledModules: data.workspace.enabledModules,
              members: data.workspace.members,
              settings: data.workspace.settings,
              metadata: data.workspace.metadata,
              // Tokens
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            });

            return mapped as any;
          }
          return null;
        } catch (err) {
          console.error('Login failed:', err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: ONE_HOUR,
  },
  callbacks: {

    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          const { data } = await api.post("/accounts/google-signin", {
            email: profile?.email,
            name: profile?.name,
            image: account?.picture,
            sub: profile?.sub,
            idToken: account?.id_token,
          });

          // Nueva estructura de respuesta para Google
          if (data?.accessToken && data.user && data.workspace) {
            const mapped = mapUserToToken({
              // Datos del usuario
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.image ?? null,
              role: data.user.role,
              permissions: data.user.permissions ?? [],
              registrationComplete: data.user.registrationComplete ?? false,
              // Datos del workspace
              workspaceId: data.workspace.id,
              workspaceName: data.workspace.name,
              slug: data.workspace.slug,
              accountType: data.workspace.accountType,
              enabledModules: data.workspace.enabledModules,
              members: data.workspace.members,
              settings: data.workspace.settings,
              metadata: data.workspace.metadata,
              // Tokens
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            }, account);

            Object.assign(user, mapped);
            return true;
          }
          return false;
        }

        return true;
      } catch (err) {
        return false;
      }
    },

    jwt: async ({ token, user, trigger, session }: { token: any; user?: any; trigger?: string; session?: any }) => {
      try {
        const accessTokenExpires = Date.now() + ONE_HOUR;        
        
        if (user) {
          console.log('[JWT] Initial login, user data:', {
            id: user.id,
            email: user.email,
            registrationComplete: user.registrationComplete
          });
          
          const mapped = mapUserToToken(user, token);
          return {
            ...token,
            ...mapped,
            registrationComplete: user.registrationComplete ?? false, 
            accessTokenExpires,
            exp: Math.floor(accessTokenExpires / 1000),
          };
        }

        // ✅ En actualización manual de sesión
        if (trigger === "update" && session) {
          console.log('[JWT] Session update triggered:', session);
          
          return {
            ...token,
            registrationComplete: session.user?.registrationComplete ?? token.registrationComplete,
            // Otros campos que puedan actualizarse
          };
        }

        // ✅ Token válido, no necesita refresh
        if (Date.now() < token.accessTokenExpires) {
          return {
            ...token,
            registrationComplete: token.registrationComplete ?? false, 
          };
        }

        const { data } = await api.post('/auth/refresh', {
          refreshToken: token.refreshToken,
        });

        const newAccessTokenExpires = Date.now() + ONE_HOUR;

        if (data.user && data.workspace) {
          return {
            ...token,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            registrationComplete: data.user.registrationComplete ?? false, 
            // ... otros campos
            accessTokenExpires: newAccessTokenExpires,
            exp: Math.floor(newAccessTokenExpires / 1000),
          };
        }

        return {
          ...token,
          registrationComplete: token.registrationComplete ?? false, 
          accessToken: data.accessToken,
          accessTokenExpires: newAccessTokenExpires,
          exp: Math.floor(newAccessTokenExpires / 1000),
        };
      } catch (err) {
        console.error('[JWT] Error:', err);
        return {
          ...token,
          registrationComplete: token.registrationComplete ?? false, 
          error: 'RefreshAccessTokenError',
          exp: Math.floor(Date.now() / 1000),
        };
      }
    },

    async session({ session, token }: { session: any; token: any }) {
      return mapTokenToSession(token, session);
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login?error=AuthenticationError',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production"
};
