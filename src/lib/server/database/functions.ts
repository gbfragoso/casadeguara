import { sql, type Column } from 'drizzle-orm';

const LIKE_WILDCARD_PATTERN = /[\\%_]/g;

export const escapeLikePattern = (text: string) => text.replace(LIKE_WILDCARD_PATTERN, '\\$&');

export const unaccent = (column: Column) => {
	return sql<string>`unaccent(${column})`;
};

export const ulike = (column: Column, value: string) => {
	return sql<string>`unaccent(${column}) ilike unaccent(${value})`;
};
