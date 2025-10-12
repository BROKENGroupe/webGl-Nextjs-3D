import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { mapUserToToken, mapTokenToSession } from "./auth-mapper"
import api from "./axios"

const ONE_HOUR = 60 * 60 * 1000;

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
        name: { label: 'Name', type: 'text' },
        action: { label: 'Action', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const isRegister = credentials?.action === 'register';
          const endpoint = isRegister ? '/accounts/register' : '/accounts/login';

          const requestData = {
            email: credentials?.email,
            password: credentials?.password,
          }
          
          const { data } = await api.post(endpoint, requestData);

          if (data && data.accessToken && data.user && data.workspace) {
            const mapped = mapUserToToken({
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.image ?? null,
              role: data.user.role,
              permissions: data.user.permissions ?? [],
              registrationComplete: data.user.registrationComplete ?? false, //   Campo clave
              workspaceId: data.workspace.id,
              workspaceName: data.workspace.name,
              slug: data.workspace.slug,
              accountType: data.workspace.accountType,
              enabledModules: data.workspace.enabledModules,
              members: data.workspace.members,
              settings: data.workspace.settings,
              metadata: data.workspace.metadata,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            });

            return mapped as any;
          }
          return null;
        } catch (err: any) {
          console.error('Auth failed:', err);
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
            image: profile?.image,
            sub: profile?.sub,
            idToken: account?.id_token,
          });

          if (data?.accessToken && data.user && data.workspace) {
            const mapped = mapUserToToken({
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.image,
              role: data.user.role,
              permissions: data.user.permissions ?? [],
              registrationComplete: data.user.registrationComplete ?? false, //   Campo clave
              workspaceId: data.workspace.id,
              workspaceName: data.workspace.name,
              slug: data.workspace.slug,
              accountType: data.workspace.accountType,
              enabledModules: data.workspace.enabledModules,
              members: data.workspace.members,
              settings: data.workspace.settings,
              metadata: data.workspace.metadata,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            }, account);

            Object.assign(user, mapped);
            return true;
          }
          return false;
        }
        return true;
      } catch (err: any) {
        console.error('SignIn failed:', err);
        return false;
      }
    },

    jwt: async ({ token, user, trigger, isNewUser }) => {
      try {
        const accessTokenExpires = Date.now() + ONE_HOUR;

        if (user) {
          console.log('[JWT] New user session:', {
            userId: user.id,
            registrationComplete: user.registrationComplete,
            isNewUser: isNewUser || trigger === 'signUp'
          });

          const mapped = mapUserToToken(user, token);
          return {
            ...token,
            ...mapped,
            isNewUser: isNewUser || trigger === 'signUp', //   Usar isNewUser de NextAuth
            accessTokenExpires,
            exp: Math.floor(accessTokenExpires / 1000),
          };
        }

        if (typeof token.accessTokenExpires === "number" && Date.now() < token.accessTokenExpires) {
          return token;
        }

        console.log('[JWT] Refreshing token...');
        const { data } = await api.post('/auth/refresh', {
          refreshToken: token.refreshToken,
        });

        const newAccessTokenExpires = Date.now() + ONE_HOUR;

        if (data.user && data.workspace) {
          return {
            ...token,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            registrationComplete: data.user.registrationComplete ?? token.registrationComplete,
            isNewUser: false, //   Limpiar después del refresh
            accessTokenExpires: newAccessTokenExpires,
            exp: Math.floor(newAccessTokenExpires / 1000),
          };
        }

        return token;
      } catch (err) {
        console.error('[JWT] Refresh failed:', err);
        return {
          ...token,
          error: 'RefreshAccessTokenError',
          exp: Math.floor(Date.now() / 1000),
        };
      }
    },

    async session({ session, token }) {
      const mappedSession = mapTokenToSession(token, session);

      //   Agregar campos de estado
      if (token.isNewUser) {
        mappedSession.isNewUser = token.isNewUser;
      }

      console.log('[SESSION] Final session:', {
        userId: mappedSession.user?.id,
        registrationComplete: mappedSession.user?.registrationComplete,
        isNewUser: mappedSession.isNewUser,
        workspaceSlug: mappedSession.workspace?.slug
      });

      return mappedSession;
    },

    //   Callback de redirección basado en registrationComplete
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      try {
        //   Verificar errores en la URL
        const urlObj = new URL(url);
        const error = urlObj.searchParams.get('error');

        if (error) {
          console.log('[REDIRECT] Error detected, going to login');
          return `${baseUrl}/auth/login?error=${error}`;
        }
      } catch (e) {
        // URL inválida, continuar
      }

      //   Redirección por defecto
      console.log('[REDIRECT] -> Default home');
      return `${baseUrl}/home`;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login?error=AuthenticationError',
    newUser: '/register-onboarding', //   Página para nuevos usuarios
  },
  events: {
    //   Eventos para audit logging
    async signIn({ user, account, isNewUser }) {
      console.log('[EVENT] User signed in:', {
        userId: user.id,
        provider: account?.provider,
        isNewUser,
        registrationComplete: (user as any).registrationComplete
      });
    },
    async createUser({ user }) {
      console.log('[EVENT] User created:', {
        userId: user.id,
        email: user.email
      });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production"
};
