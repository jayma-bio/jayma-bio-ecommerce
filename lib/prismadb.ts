import { PrismaClient } from '@/prisma/generated';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});
 const prismadb = new PrismaClient({ adapter });
 export default prismadb;