import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';

export const prisma = new PrismaClient({
	log: [
		{
			emit: 'event',
			level: 'query'
		},
		{
			emit: 'stdout',
			level: 'error'
		},
		{
			emit: 'stdout',
			level: 'info'
		},
		{
			emit: 'stdout',
			level: 'warn'
		}
	]
});

prisma.$on('query', (e) => {
	console.log('Query: ' + e.query);
	console.log('Params: ' + e.params);
	console.log('Duration: ' + e.duration + 'ms');
});

export const adapter = new PrismaAdapter(prisma.session, prisma.user);
