import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from "$lib/server/drizzle/schema";
import { sql } from "@vercel/postgres";

export const db = drizzle(sql, { schema });