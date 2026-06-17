import { PrismaClient } from './apps/backend/node_modules/@prisma/client';
const prisma = new PrismaClient();
prisma.connectedAccount.findMany().then(console.log).catch(console.error).finally(() => prisma.$disconnect());
