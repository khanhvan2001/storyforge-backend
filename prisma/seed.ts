import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('123456', 10);

  await prisma.user.create({
    data: {
      username: 'admin',
      password,
    },
  });

  const users = [
    { username: 'nhunng' },
    { username: 'vupq' },
    { username: 'anhdh' },
    { username: 'sangpg' },
    { username: 'hainn' },
    { username: 'vanndk' },
    { username: 'nhannh' },
    { username: 'trietnn' },
    { username: 'ngannt' },
    { username: 'phatnt' }
  ];

  for (const user of users) {
    await prisma.user.create({
      data: {
        username: user.username,
        password,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

