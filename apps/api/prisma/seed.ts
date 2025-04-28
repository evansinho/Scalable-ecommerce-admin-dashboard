// apps/api/prisma/seed.ts
import { PrismaClient, Role } from '../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  // Clear existing data
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const users = await prisma.user.createMany({
    data: [
      { email: 'admin@example.com', name: 'Admin', password: adminHash, role: Role.ADMIN },
      { email: 'user1@example.com', name: 'User One', password: passwordHash, role: Role.USER },
      { email: 'user2@example.com', name: 'User Two', password: passwordHash, role: Role.USER },
    ],
  });

  const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  const user1 = await prisma.user.findUnique({ where: { email: 'user1@example.com' } });
  const user2 = await prisma.user.findUnique({ where: { email: 'user2@example.com' } });

  // Create products
  const products = await prisma.product.createMany({
    data: [
      { name: 'Laptop', description: 'Powerful laptop', price: 1200 },
      { name: 'Phone', description: 'Smartphone with great camera', price: 700 },
      { name: 'Headphones', description: 'Noise-cancelling', price: 150 },
    ],
  });

  const allProducts = await prisma.product.findMany();

  // Create orders
  await prisma.order.createMany({
    data: [
      { userId: user1!.id, productId: allProducts[0].id, quantity: 1 },
      { userId: user1!.id, productId: allProducts[2].id, quantity: 2 },
      { userId: user2!.id, productId: allProducts[1].id, quantity: 1 },
    ],
  });

  console.log('✅ Seeding complete!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
