import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';

import { cadastros } from '$lib/server/database/schema';
import { increment, ulike, unaccent } from '$lib/server/database/functions';

const dialect = new PgDialect();

describe('database SQL functions', () => {
	it('builds accent-insensitive search and increment expressions', () => {
		const unaccented = dialect.sqlToQuery(unaccent(cadastros.nome));
		const search = dialect.sqlToQuery(ulike(cadastros.nome, 'Ana'));
		const incremented = dialect.sqlToQuery(increment(cadastros.idleitor));
		const customIncrement = dialect.sqlToQuery(increment(cadastros.idleitor, 2));

		expect(unaccented.sql).toContain('unaccent');
		expect(search.sql).toContain('ilike');
		expect(search.params).toEqual(['Ana']);
		expect(incremented.params).toEqual([1]);
		expect(customIncrement.params).toEqual([2]);
	});
});
