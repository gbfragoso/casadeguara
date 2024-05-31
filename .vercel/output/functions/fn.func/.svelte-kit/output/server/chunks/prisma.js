import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
const prisma = new PrismaClient();
const adapter = new PrismaAdapter(prisma.session, prisma.user);
export {
  adapter as a,
  prisma as p
};
