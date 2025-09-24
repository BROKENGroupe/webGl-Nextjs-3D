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
          const { data: user } = await api.post('/auth/login', {
            email: credentials?.email,
            password: credentials?.password,
          });

          if (user && user.accessToken) {
            console.log('[user auth] Credentials', user);
            
            const mapped = mapUserToToken({
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image ?? null,
              accessToken: user.accessToken,
              refreshToken: user.refreshToken,
              permissions: user.permissions ?? [],
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
          const { data } = await api.post("/auth/google", {
            email: profile?.email,
            name: profile?.name,
            image: account?.picture,
            sub: profile?.sub,
            idToken: account?.id_token,
          });

          if (data?.accessToken) {

            const mapped = mapUserToToken({
              id: data.id,
              email: data.email,
              name: data.name,
              image: data.image ?? null,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              permissions: data.permissions ?? [],
            }, account);

            Object.assign(user, mapped);
            return true;
          }
          return false;
        }

        return true;
      } catch (err) {
        console.error("Google signIn failed:", err);
        return false;
      }
    },

    jwt: async ({ token, user }: { token: any; user?: any; }) => {
      try {
        const accessTokenExpires = Date.now() + ONE_HOUR;
        if (user) {

          if (user) {
            const mapped = mapUserToToken(user, token);
            return {
              ...token,
              ...mapped,
              accessTokenExpires,
              exp: Math.floor(accessTokenExpires / 1000),
            };
          }
        }

        if (Date.now() < token.accessTokenExpires) {
          return token;
        }

        const { data } = await api.post('/auth/refresh', {
          refreshToken: token.refreshToken,
        });

        const newAccessTokenExpires = Date.now() + ONE_HOUR;

        return {
          ...token,
          accessToken: data.accessToken,
          accessTokenExpires: newAccessTokenExpires,
          exp: Math.floor(newAccessTokenExpires / 1000),
        };
      } catch (err) {
        console.log('Failed to refresh token:', err);
        return {
          ...token,
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
