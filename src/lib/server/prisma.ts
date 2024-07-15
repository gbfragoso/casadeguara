import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

//prisma.$on('query', (e) => {
//	console.log('Query: ' + e.query);
//	console.log('Params: ' + e.params);
//	console.log('Duration: ' + e.duration + 'ms');
//});