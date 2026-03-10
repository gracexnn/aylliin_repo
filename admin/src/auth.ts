import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/db/client';
import { z } from 'zod';

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Имэйл', type: 'email' },
        password: { label: 'Нууц үг', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = SignInSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const email = parsedCredentials.data.email.trim().toLowerCase();
        const adminUser = await prisma.adminUser.findUnique({
          where: { email },
        });

        if (!adminUser || !adminUser.is_active) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          parsedCredentials.data.password,
          adminUser.password_hash
        );

        if (!passwordMatches) {
          return null;
        }

        await prisma.adminUser.update({
          where: { id: adminUser.id },
          data: {
            last_login_at: new Date(),
          },
        });

        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
        };
      },
    }),
  ],
};

export function getAdminSession() {
  return getServerSession(authOptions);
}