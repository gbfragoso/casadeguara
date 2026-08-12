import { randomUUID } from 'node:crypto';

import { db } from '$lib/database/connection';
import { autor } from '$lib/database/schema';
import { AUTHOR_FETCH_LIMIT, autorModel } from '$lib/server/models/autor';
import { eq } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';

const createdNames: string[] = [];

async function createAuthor(name: string) {
	createdNames.push(name);
	await autorModel.create(name);
}

afterEach(async () => {
	for (const name of createdNames.splice(0)) await db.delete(autor).where(eq(autor.nome, name));
});

describe('AutorModel', () => {
	it('fetches the first fifty authors without a filter', async () => {
		const authors = await autorModel.fetch('');

		expect(authors).toHaveLength(Math.min(AUTHOR_FETCH_LIMIT, authors.length));
		expect(authors.every(({ idautor, nome }) => Number.isInteger(idautor) && typeof nome === 'string')).toBe(true);
	});

	it('filters accent-insensitive prefixes in order and limits results', async () => {
		const token = randomUUID();
		const names = Array.from(
			{ length: AUTHOR_FETCH_LIMIT + 1 },
			(_, index) => `TéST-${token} ${String(index).padStart(2, '0')}`,
		);

		for (const name of names) await createAuthor(name);
		const authors = await autorModel.fetch(`test-${token}`);

		expect(authors.map(({ nome }) => nome)).toEqual(names.slice(0, AUTHOR_FETCH_LIMIT));
	});

	it('gets an existing author and returns undefined when missing', async () => {
		const name = `AUTOR ${randomUUID()}`;
		await createAuthor(name);
		const created = (await autorModel.fetch(name))[0];

		expect(await autorModel.get(created.idautor)).toEqual(created);
		expect(await autorModel.get(-1)).toBeUndefined();
	});

	it('updates an existing author', async () => {
		const name = `AUTOR ${randomUUID()}`;
		await createAuthor(name);
		const created = (await autorModel.fetch(name))[0];
		const updatedName = `${name} ALTERADO`;
		createdNames.push(updatedName);

		expect(await autorModel.update(created.idautor, updatedName)).toBe(true);
		expect(await autorModel.get(created.idautor)).toEqual({ idautor: created.idautor, nome: updatedName });
	});

	it('reports a missing author update', async () => {
		const name = `AUTOR ${randomUUID()}`;

		expect(await autorModel.update(-1, name)).toBe(false);
	});
});
