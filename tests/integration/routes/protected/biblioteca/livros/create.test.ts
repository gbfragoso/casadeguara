import { randomUUID } from 'node:crypto';

import { db } from '$lib/server/database/connection';
import { livro } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { actions, load } from '../../../../../../src/routes/(protected)/biblioteca/livros/novo/+page.server';
import { bibliotecaUser } from '../../../../support/auth';
import { createRequestEvent, invoke } from '../../../../support/request-event';
import { createBookForm, createBookReferences, deleteBookByTombo, deleteBookReferences } from './create-support';

const createRequest = (form: FormData) => new Request('http://localhost/', { method: 'POST', body: form });
const submitBookForm = (form: FormData) =>
	invoke(
		actions.default,
		createRequestEvent({ locals: { user: bibliotecaUser, session: null }, request: createRequest(form) }),
	);

describe('book create route exports', () => {
	it('loads complete publisher, collection, and author options for an authorized user', async () => {
		const references = await createBookReferences();

		try {
			const result = await invoke(load, createRequestEvent({ locals: { user: bibliotecaUser, session: null } }));

			if (!result || !('editoras' in result) || !('colecoes' in result) || !('autores' in result)) {
				throw new Error('Missing book options.');
			}
			expect(
				result.editoras.find(
					(item: { ideditora: number }) => item.ideditora === references.publisher.ideditora,
				),
			).toMatchObject({
				ideditora: references.publisher.ideditora,
			});
			expect(
				result.colecoes.find((item: { idserie: number }) => item.idserie === references.collection.idserie),
			).toMatchObject({
				idserie: references.collection.idserie,
			});
			expect(
				result.autores.find((item: { idautor: number }) => item.idautor === references.author.idautor),
			).toMatchObject({
				idautor: references.author.idautor,
			});
		} finally {
			await deleteBookReferences(references);
		}
	});

	it('rejects invalid registration without mutating the catalog', async () => {
		const references = await createBookReferences();
		const invalid = createBookForm(
			references.publisher.ideditora,
			references.collection.idserie,
			references.author.idautor,
			'invalid',
		);
		invalid.set('titulo', '123');
		invalid.set('editora', '0');

		try {
			const before = await db.select({ id: livro.idlivro }).from(livro).where(eq(livro.tombo, 'invalid'));
			const result = await invoke(
				actions.default,
				createRequestEvent({
					locals: { user: bibliotecaUser, session: null },
					request: createRequest(invalid),
				}),
			);
			const after = await db.select({ id: livro.idlivro }).from(livro).where(eq(livro.tombo, 'invalid'));

			expect(result).toMatchObject({ status: 400, data: { values: { tombo: 'invalid', titulo: '123' } } });
			expect(after).toEqual(before);
		} finally {
			await deleteBookReferences(references);
		}
	});

	it('commits one book and translates duplicate and missing reference failures', async () => {
		const references = await createBookReferences();
		const tombo = randomUUID().replace(/\D/g, '').slice(0, 8).padEnd(8, '2');
		const form = createBookForm(
			references.publisher.ideditora,
			references.collection.idserie,
			references.author.idautor,
			tombo,
		);

		try {
			const created = await submitBookForm(form);
			const duplicate = await submitBookForm(form);
			const [book] = await db.select().from(livro).where(eq(livro.tombo, tombo));
			const missingReference = createBookForm(
				32766,
				references.collection.idserie,
				references.author.idautor,
				`${tombo.slice(0, 7)}9`,
			);
			const missing = await submitBookForm(missingReference);

			expect(created).toMatchObject({ outcome: 'created', idlivro: book.idlivro });
			expect(duplicate).toMatchObject({ status: 409, data: { errors: { tombo: [expect.any(String)] } } });
			expect(missing).toMatchObject({ status: 400, data: { errors: { editora: [expect.any(String)] } } });
		} finally {
			await deleteBookByTombo(tombo);
			await deleteBookReferences(references);
		}
	});
});
