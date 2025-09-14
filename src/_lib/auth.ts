import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { NextAuthOptions } from 'next-auth';
import axios from 'axios';

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
            console.log('[user auth] Credentials', user)
            return {
              id: user.id,
              name: user.username,
              email: user.email,
              image: user.image ?? null,
              accessToken: user.accessToken,
              refreshToken: user.refreshToken,
              permissions: user.permissions ?? null,
            };
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
    jwt: async ({ token, user }: { token: any; user?: any; }) => {
      try {
        const accessTokenExpires = Date.now() + ONE_HOUR;       
        if (user) {
          return {
            ...token,
            id: user.id,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            permissions: user.permissions ?? null,
            accessTokenExpires,
            exp: Math.floor(accessTokenExpires / 1000),
          };
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
      if (token?.id && session.user) {
        session.user.id = token.id;
      }
      session.accessToken = token.accessToken ?? null;
      session.refreshToken = token.refreshToken ?? null;
      session.permissions = token.permissions ?? null;
      session.error = token.error ?? null;     
      console.log('[user auth] session', session, token)
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login?error=AuthenticationError',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production"
};
