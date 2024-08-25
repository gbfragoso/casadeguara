import { Column, sql } from "drizzle-orm";

export const unaccent = (column: Column) => {
    return sql<string>`unaccent(${column})`;
};

export const ulike = (column: Column, value: String) => {
    return sql<string>`unaccent(${column}) ilike unaccent(${value})`;
};