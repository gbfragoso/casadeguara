import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';
 
dotenv.config();

export default defineConfig({
    out: "./src/lib/server/drizzle",
    schema: "./src/lib/server/drizzle/schema.ts",
    dialect: "postgresql",
    breakpoints: true,
    dbCredentials: {
        url: process.env.POSTGRES_URL!,
    }
});