import { Column, sql, type AnyColumn } from 'drizzle-orm';

export const unaccent = (column: Column) => {
	return sql<string>`unaccent(${column})`;
};

export const ulike = (column: Column, value: string) => {
	return sql<string>`unaccent(${column}) ilike unaccent(${value})`;
};

export const increment = (column: AnyColumn, value = 1) => {
	return sql`${column} + ${value}`;
};
