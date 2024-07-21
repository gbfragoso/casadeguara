import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

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
