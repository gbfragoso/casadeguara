import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
	dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
} else {
	dotenv.config({ path: '.env' });
}

export const db = drizzle(sql, { schema });
