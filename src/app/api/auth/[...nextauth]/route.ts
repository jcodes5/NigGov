
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import type { AuthOptions, User as NextAuthUser, Session as NextAuthSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs';
import { getFullUserByEmail } from '@/lib/data';
import type { UserRole } from '@/types/next-auth';

// Define providers here as you add them
const providers = [
  // GoogleProvider({
  //   clientId: process.env.GOOGLE_CLIENT_ID as string,
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  // }),
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials, req) {
  try {
    if (!credentials?.email || !credentials.password) {
      throw new Error('Email and password are required.');
    }

    const userFromDb = await getFullUserByEmail(credentials.email);
    if (!userFromDb || !userFromDb.password) {
      throw new Error('Invalid email or password.');
    }

    const isValidPassword = await bcrypt.compare(credentials.password, userFromDb.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password.');
    }

    if (!userFromDb.emailVerified) {
      throw new Error('Email not verified. Please check your inbox.');
    }

    return {
      id: userFromDb.id,
      name: userFromDb.name,
      email: userFromDb.email,
      image: userFromDb.image,
      role: userFromDb.role as UserRole,
    };
  } catch (err) {
    console.error('[CredentialsProvider][AuthorizeError]', err);
    throw new Error('Failed to authorize. Please try again.');
  }
},
}),
];

export const authOptions: AuthOptions & {trustHost: boolean} = {
  adapter: PrismaAdapter(prisma),
  providers: providers,
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
  pages: {
    signIn: '/login',
    // error: '/auth/error', // A custom error page
    // verifyRequest: '/auth/verify-request', // A custom page for checking email
  },
  debug: true, // ✅ Enables detailed logs
  logger: {
    error(code, metadata) {
      console.error('[NextAuth][Error]', code, metadata);
    },
    warn(code) {
      console.warn('[NextAuth][Warn]', code);
    },
    debug(code, metadata) {
      console.debug('[NextAuth][Debug]', code, metadata);
    },
  },
  callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id ?? '';
      token.role = (user as any)?.role ?? 'user'; // fallback for OAuth users
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole ?? 'user';
    }
    return session;
  },
},
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
