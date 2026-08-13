import { randomUUID } from 'node:crypto';

import { db } from '$lib/database/connection';
import { keyword } from '$lib/database/schema';
import { KEYWORD_FETCH_LIMIT, KeywordModel } from '$lib/server/models/keyword';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

const model = new KeywordModel(db);
const TEST_TOKEN_LENGTH = 12;

const createTestKey = (suffix: string) => `T${randomUUID().replaceAll('-', '').slice(0, TEST_TOKEN_LENGTH)}${suffix}`;

async function withKeywords<T>(keys: string[], callback: (items: { idkeyword: number; chave: string }[]) => Promise<T>) {
	const items = (await Promise.all(keys.map((key) => model.create(key)))).flat();

	try {
		return await callback(items);
	} finally {
		await Promise.all(items.map(({ idkeyword }) => db.delete(keyword).where(eq(keyword.idkeyword, idkeyword))));
	}
}

describe('KeywordModel', () => {
	it('fetches unfiltered keywords with their public fields', async () => {
		const key = `!${createTestKey('livre')}`;

		await withKeywords([key], async ([created]) => {
			expect(await model.fetch('')).toContainEqual(created);
		});
	});

	it('filters prefixes without accents or case sensitivity', async () => {
		const key = createTestKey('Árvore');

		await withKeywords([key], async ([created]) => {
			expect(await model.fetch(key.replace('Á', 'a').toLowerCase())).toContainEqual(created);
		});
	});

	it('orders matching keywords by their unaccented keys', async () => {
		const prefix = createTestKey('ordem');
		const keys = [`${prefix}Çac`, `${prefix}Álvaro`, `${prefix}Bruno`];

		await withKeywords(keys, async () => {
			expect((await model.fetch(prefix)).map(({ chave }) => chave)).toEqual([keys[1], keys[2], keys[0]]);
		});
	});

	it('limits matching keywords to fifty rows', async () => {
		const prefix = createTestKey('limite');
		const keys = Array.from({ length: KEYWORD_FETCH_LIMIT + 1 }, (_, index) => `${prefix}${index}`);

		await withKeywords(keys, async () => {
			expect(await model.fetch(prefix)).toHaveLength(KEYWORD_FETCH_LIMIT);
		});
	});

	it('gets existing and missing keywords', async () => {
		await withKeywords([createTestKey('consulta')], async ([created]) => {
			expect(await model.get(created.idkeyword)).toEqual(created);
			expect(await model.get(-1)).toBeUndefined();
		});
	});

	it('creates a keyword with public fields', async () => {
		await withKeywords([createTestKey('criada')], async ([created]) => {
			expect(created).toEqual({ idkeyword: expect.any(Number), chave: expect.any(String) });
		});
	});

	it('updates a keyword', async () => {
		await withKeywords([createTestKey('criada')], async ([created]) => {
			const updated = createTestKey('atualizada');

			expect(await model.update(created.idkeyword, updated)).toBe(true);
			expect(await model.get(created.idkeyword)).toEqual({ ...created, chave: updated });
		});
	});

	it('reports a missing keyword update', async () => {
		expect(await model.update(-1, createTestKey('ausente'))).toBe(false);
	});
});
