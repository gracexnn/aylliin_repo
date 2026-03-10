import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD?.trim();
  const name = process.env.ADMIN_SEED_NAME?.trim() || 'Admin User';

  if (!email || !password) {
    throw new Error('Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD before running the seed script.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: {
      name,
      password_hash: passwordHash,
      is_active: true,
    },
    create: {
      email,
      name,
      password_hash: passwordHash,
      is_active: true,
    },
  });

  console.log(`Admin user ready: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });