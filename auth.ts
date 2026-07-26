import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { username, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.username,
          email: user.email ?? "",
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      if (account?.provider === "github") {
        const githubProfile = profile as
          | { email?: string; name?: string; image?: string }
          | undefined;
        const email = githubProfile?.email ?? user.email;
        if (typeof email !== "string" || email.length === 0) {
          return false;
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          await prisma.user.create({
            data: {
              email,
              name: githubProfile?.name ?? user.name ?? null,
              image: githubProfile?.image ?? user.image ?? null,
              provider: "github",
              providerAccountId: account.providerAccountId,
            },
          });
        }
      }
      return true;
    },
    jwt: async ({ token, account }) => {
      if (account?.provider === "github" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
