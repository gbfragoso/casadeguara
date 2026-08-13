import { randomUUID } from 'node:crypto';

import { db } from '$lib/database/connection';
import { editora } from '$lib/database/schema';
import { EditoraModel, PUBLISHER_FETCH_LIMIT } from '$lib/server/models/editora';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

const model = new EditoraModel(db);
const createTestName = (name: string) => `0teste-${randomUUID()}-${name}`;

async function withPublishers<T>(
	names: string[],
	callback: (publishers: { ideditora: number; nome: string }[]) => Promise<T>,
) {
	const publishers = (await Promise.all(names.map((name) => model.create(name)))).flat();

	try {
		return await callback(publishers);
	} finally {
		await Promise.all(
			publishers.map(({ ideditora }) => db.delete(editora).where(eq(editora.ideditora, ideditora))),
		);
	}
}

describe('EditoraModel', () => {
	it('fetches unfiltered publishers and only their public fields', async () => {
		const name = createTestName('livre');

		await withPublishers([name], async ([created]) => {
			const publishers = await model.fetch('');

			expect(publishers).toContainEqual({ ideditora: created.ideditora, nome: name });
		});
	});

	it('filters prefixes without accents or case sensitivity', async () => {
		const prefix = createTestName('Árvore');

		await withPublishers([prefix], async ([created]) => {
			const publishers = await model.fetch(prefix.replace('Á', 'a').toLowerCase());

			expect(publishers).toContainEqual({ ideditora: created.ideditora, nome: prefix });
		});
	});

	it('orders matching publishers by their unaccented name', async () => {
		const prefix = createTestName('ordem');
		const names = [`${prefix}-Çac`, `${prefix}-Álvaro`, `${prefix}-Bruno`];

		await withPublishers(names, async () => {
			const publishers = await model.fetch(`${prefix}-`);

			expect(publishers.map(({ nome }) => nome)).toEqual([names[1], names[2], names[0]]);
		});
	});

	it('limits matching publishers to fifty rows', async () => {
		const prefix = createTestName('limite');
		const names = Array.from({ length: PUBLISHER_FETCH_LIMIT + 1 }, (_, index) => `${prefix}-${index}`);

		await withPublishers(names, async () => {
			const publishers = await model.fetch(`${prefix}-`);

			expect(publishers).toHaveLength(PUBLISHER_FETCH_LIMIT);
		});
	});

	it('gets an existing publisher and returns undefined for a missing publisher', async () => {
		const name = createTestName('consulta');

		await withPublishers([name], async ([created]) => {
			expect(await model.get(created.ideditora)).toEqual(created);
			expect(await model.get(-1)).toBeUndefined();
		});
	});

	it('creates publishers and updates an existing row', async () => {
		const name = createTestName('criado');
		const updatedName = createTestName('atualizado');

		await withPublishers([name], async ([created]) => {
			expect(created).toEqual({ ideditora: expect.any(Number), nome: name });
			expect(await model.update(created.ideditora, updatedName)).toBe(true);
			expect(await model.get(created.ideditora)).toEqual({ ideditora: created.ideditora, nome: updatedName });
		});
	});

	it('reports when an update does not change a row', async () => {
		expect(await model.update(-1, createTestName('ausente'))).toBe(false);
	});
});
