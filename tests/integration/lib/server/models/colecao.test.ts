import { randomUUID } from 'node:crypto';

import { db } from '$lib/database/connection';
import { serie } from '$lib/database/schema';
import { COLLECTION_FETCH_LIMIT, ColecaoModel } from '$lib/server/models/colecao';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

const model = new ColecaoModel(db);
const TEST_TOKEN_LENGTH = 12;

const createTestName = (suffix: string) => `T${randomUUID().replaceAll('-', '').slice(0, TEST_TOKEN_LENGTH)}${suffix}`;

async function withCollections<T>(
	names: string[],
	callback: (items: { idserie: number; nome: string }[]) => Promise<T>,
) {
	const items = (await Promise.all(names.map((name) => model.create(name)))).flat();

	try {
		return await callback(items);
	} finally {
		await Promise.all(items.map(({ idserie }) => db.delete(serie).where(eq(serie.idserie, idserie))));
	}
}

describe('ColecaoModel', () => {
	it('fetches unfiltered collections with their public fields', async () => {
		const name = `!${createTestName('livre')}`;

		await withCollections([name], async ([created]) => {
			expect(await model.fetch('')).toContainEqual(created);
		});
	});

	it('filters prefixes without accents or case sensitivity', async () => {
		const name = createTestName('Árvore');

		await withCollections([name], async ([created]) => {
			expect(await model.fetch(name.replace('Á', 'a').toLowerCase())).toContainEqual(created);
		});
	});

	it('orders matching collections by their unaccented names', async () => {
		const prefix = createTestName('ordem');
		const names = [`${prefix}Çac`, `${prefix}Álvaro`, `${prefix}Bruno`];

		await withCollections(names, async () => {
			expect((await model.fetch(prefix)).map(({ nome }) => nome)).toEqual([names[1], names[2], names[0]]);
		});
	});

	it('limits matching collections to fifty rows', async () => {
		const prefix = createTestName('limite');
		const names = Array.from({ length: COLLECTION_FETCH_LIMIT + 1 }, (_, index) => `${prefix}${index}`);

		await withCollections(names, async () => {
			expect(await model.fetch(prefix)).toHaveLength(COLLECTION_FETCH_LIMIT);
		});
	});

	it('gets existing and missing collections', async () => {
		await withCollections([createTestName('consulta')], async ([created]) => {
			expect(await model.get(created.idserie)).toEqual(created);
			expect(await model.get(-1)).toBeUndefined();
		});
	});

	it('creates a collection with public fields', async () => {
		await withCollections([createTestName('criada')], async ([created]) => {
			expect(created).toEqual({ idserie: expect.any(Number), nome: expect.any(String) });
		});
	});

	it('updates a collection', async () => {
		await withCollections([createTestName('criada')], async ([created]) => {
			const updated = createTestName('atualizada');

			expect(await model.update(created.idserie, updated)).toBe(true);
			expect(await model.get(created.idserie)).toEqual({ ...created, nome: updated });
		});
	});

	it('reports a missing collection update', async () => {
		expect(await model.update(-1, createTestName('ausente'))).toBe(false);
	});
});
