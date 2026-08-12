import { randomUUID } from 'node:crypto';

import { db } from '$lib/database/connection';
import { autor } from '$lib/database/schema';
import { AUTHOR_FETCH_LIMIT, AutorModel } from '$lib/server/models/autor';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

const model = new AutorModel(db);

const createTestName = (name: string) => `0teste-${randomUUID()}-${name}`;

async function withAuthors<T>(names: string[], callback: (authors: { idautor: number; nome: string }[]) => Promise<T>) {
	const authors = (await Promise.all(names.map((name) => model.create(name)))).flat();

	try {
		return await callback(authors);
	} finally {
		await Promise.all(authors.map(({ idautor }) => db.delete(autor).where(eq(autor.idautor, idautor))));
	}
}

describe('AutorModel', () => {
	it('fetches unfiltered authors and only their public fields', async () => {
		const name = createTestName('livre');

		await withAuthors([name], async ([created]) => {
			const authors = await model.fetch('');

			expect(authors).toContainEqual({ idautor: created.idautor, nome: name });
		});
	});

	it('filters prefixes without accents or case sensitivity', async () => {
		const prefix = createTestName('Árvore');

		await withAuthors([prefix], async ([created]) => {
			const authors = await model.fetch(prefix.replace('Á', 'a').toLowerCase());

			expect(authors).toContainEqual({ idautor: created.idautor, nome: prefix });
		});
	});

	it('orders matching authors by their unaccented name', async () => {
		const prefix = createTestName('ordem');
		const names = [`${prefix}-Çac`, `${prefix}-Álvaro`, `${prefix}-Bruno`];

		await withAuthors(names, async () => {
			const authors = await model.fetch(`${prefix}-`);

			expect(authors.map(({ nome }) => nome)).toEqual([names[1], names[2], names[0]]);
		});
	});

	it('limits matching authors to fifty rows', async () => {
		const prefix = createTestName('limite');
		const names = Array.from({ length: AUTHOR_FETCH_LIMIT + 1 }, (_, index) => `${prefix}-${index}`);

		await withAuthors(names, async () => {
			const authors = await model.fetch(`${prefix}-`);

			expect(authors).toHaveLength(AUTHOR_FETCH_LIMIT);
		});
	});

	it('gets an existing author and returns undefined for a missing author', async () => {
		const name = createTestName('consulta');

		await withAuthors([name], async ([created]) => {
			expect(await model.get(created.idautor)).toEqual(created);
			expect(await model.get(-1)).toBeUndefined();
		});
	});

	it('creates authors and updates an existing row', async () => {
		const name = createTestName('criado');
		const updatedName = createTestName('atualizado');

		await withAuthors([name], async ([created]) => {
			expect(created).toEqual({ idautor: expect.any(Number), nome: name });
			expect(await model.update(created.idautor, updatedName)).toBe(true);
			expect(await model.get(created.idautor)).toEqual({ idautor: created.idautor, nome: updatedName });
		});
	});

	it('reports when an update does not change a row', async () => {
		expect(await model.update(-1, createTestName('ausente'))).toBe(false);
	});
});
