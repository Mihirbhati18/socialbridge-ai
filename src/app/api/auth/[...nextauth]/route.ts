import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/backend/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";

async function upsertUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    } as any;
  }

  const newUser = await prisma.user.create({
    data: {
      email,
      name: email.split('@')[0],
      role: "CITIZEN",
    },
  });
  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
  } as any;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        }
      }
    }),
    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null;

        const verification = await prisma.verificationCode.findFirst({
          where: {
            email: credentials.email,
            code: credentials.otp,
            expires: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (!verification) return null;

        await prisma.verificationCode.delete({
          where: { id: verification.id }
        });

        return upsertUser(credentials.email);
      },
    }),
    CredentialsProvider({
      id: "trust-otp",
      name: "Trusted OTP",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        return upsertUser(credentials.email);
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        // If it's Google or GitHub, we want to redirect to the OTP page
        return `/auth/login?step=otp&email=${encodeURIComponent(user.email || "")}`;
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
