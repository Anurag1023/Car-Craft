import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@carcraft.local" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: {
            dealership: true,
          },
        });

        if (!user) {
          throw new Error("No account found with this email address");
        }

        if (user.status === "SUSPENDED") {
          throw new Error("Your account has been suspended. Please contact administrator.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid credentials provided");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          dealershipId: user.dealershipId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.dealershipId = user.dealershipId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.dealershipId = token.dealershipId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "carcraft-super-secret-key-32-chars-long-security-token",
};
