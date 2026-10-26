import { sql, type Column } from 'drizzle-orm';

const LIKE_WILDCARD_PATTERN = /[\\%_]/g;

export const escapeLikePattern = (text: string) => text.replace(LIKE_WILDCARD_PATTERN, '\\$&');

export const unaccent = (column: Column) => {
	return sql<string>`unaccent(${column})`;
};

export const ulike = (column: Column, value: string) => {
	return sql<string>`unaccent(${column}) ilike unaccent(${value})`;
};

export const rolesOverlap = (column: Column, roles: readonly string[]) => {
	const roleParameters = sql.join(
		roles.map((role) => sql`${role}`),
		sql`, `,
	);

	return sql<boolean>`regexp_split_to_array(${column}, '\s*,\s*') && ARRAY[${roleParameters}]::text[]`;
};
