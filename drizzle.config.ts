import { defineConfig } from 'drizzle-kit';

if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL is not set');

export default defineConfig({
	dialect: 'postgresql',
	out: './src/lib/database/',
	schema: './src/lib/database/schema.ts',
	dbCredentials: {
		url: process.env.POSTGRES_URL!,
		ssl: process.env.NODE_ENV === 'production' ? 'require' : undefined,
	},
	verbose: true,
	strict: true,
});
