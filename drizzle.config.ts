import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

if (process.env.NODE_ENV === 'development') {
	dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
} else {
	dotenv.config({ path: '.env' });
}

export default defineConfig({
	dialect: 'postgresql',
	out: './src/lib/database/',
	schema: './src/lib/database/schema.ts',
	dbCredentials: {
		url: process.env.POSTGRES_URL!,
	},
	verbose: true,
	strict: true,
});
