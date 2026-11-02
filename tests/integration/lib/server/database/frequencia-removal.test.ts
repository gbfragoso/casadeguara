import { describe, expect, it } from 'vitest';

import { withProvisionedDatabase } from './migration-test-support';

describe('TI-05 frequencia removal', () => {
	it('has no frequencia table and keeps cadastros.frequencia', async () => {
		await withProvisionedDatabase(async (database) => {
			const client = database.$client;

			const [table] = await client`select to_regclass('public.frequencia')::text as name`;
			const columns = await client`
				select column_name from information_schema.columns
				where table_schema = 'public' and table_name = 'cadastros' and column_name = 'frequencia'`;

			expect(table.name).toBeNull();
			expect(columns).toHaveLength(1);
		});
	});
});
