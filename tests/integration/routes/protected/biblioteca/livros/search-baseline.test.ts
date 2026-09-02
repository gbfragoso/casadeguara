import { randomUUID } from 'node:crypto';

import { db } from '$lib/server/database/connection';
import { exemplar, livro } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { actions, load } from '../../../../../../src/routes/(protected)/biblioteca/livros/+page.server';
import { bibliotecaUser } from '../../../../support/auth';
import { createRequestEvent, invoke } from '../../../../support/request-event';

const createRequest = (form: FormData) => new Request('http://localhost/', { method: 'POST', body: form });
const adminUser = { ...bibliotecaUser, roles: 'biblioteca:admin' };

async function createBook() {
	const token = randomUUID().replace(/\D/g, '').slice(0, 8).padEnd(8, '1');
	const [book] = await db
		.insert(livro)
		.values({ tombo: token, titulo: `Título ${token}` })
		.returning();
	return book;
}

describe('book list route exports', () => {
	it('loads collections only after authorization and reports administrative access', async () => {
		const authorizedEvent = createRequestEvent({ locals: { user: bibliotecaUser, session: null } });
		const adminEvent = createRequestEvent({ locals: { user: adminUser, session: null } });

		expect(await invoke(load, authorizedEvent)).toMatchObject({ isAdmin: false, role: bibliotecaUser.roles });
		expect(await invoke(load, adminEvent)).toMatchObject({ isAdmin: true });
		await expect(invoke(load, createRequestEvent())).rejects.toMatchObject({ status: 302 });
	});

	it('searches through the real route action and preserves the normalized form values', async () => {
		const book = await createBook();
		const form = new FormData();
		form.set('tombo', book.tombo);

		try {
			const event = createRequestEvent({
				locals: { user: bibliotecaUser, session: null },
				request: createRequest(form),
			});
			const result = await invoke(actions.pesquisar, event);

			expect(result).toEqual({
				livros: [
					{ idlivro: book.idlivro, tombo: book.tombo, titulo: book.titulo, keyword: null, referencia: null },
				],
				values: { tombo: book.tombo, titulo: '', autor: '', editora: '', serie: '', colecao: '', keyword: '' },
			});
		} finally {
			await db.delete(livro).where(eq(livro.idlivro, book.idlivro));
		}
	});

	it('allows only an administrator to delete through the request body', async () => {
		const book = await createBook();
		const form = new FormData();
		form.set('idlivro', `${book.idlivro}`);

		try {
			const result = await invoke(
				actions.excluir,
				createRequestEvent({ locals: { user: adminUser, session: null }, request: createRequest(form) }),
			);

			expect(result).toEqual({ outcome: 'deleted', message: 'Livro excluído com sucesso.' });
			expect(await db.select().from(livro).where(eq(livro.idlivro, book.idlivro))).toEqual([]);
			await expect(
				invoke(
					actions.excluir,
					createRequestEvent({
						locals: { user: bibliotecaUser, session: null },
						request: createRequest(form),
					}),
				),
			).rejects.toMatchObject({ status: 401 });
		} finally {
			await db.delete(livro).where(eq(livro.idlivro, book.idlivro));
		}
	});

	it('distinguishes invalid, missing and dependent delete requests', async () => {
		const dependent = await createBook();
		const invalidForm = new FormData();
		invalidForm.set('idlivro', 'not-an-id');
		const missingForm = new FormData();
		missingForm.set('idlivro', '32767');
		const dependentForm = new FormData();
		dependentForm.set('idlivro', `${dependent.idlivro}`);

		try {
			const invalid = await invoke(
				actions.excluir,
				createRequestEvent({ locals: { user: adminUser, session: null }, request: createRequest(invalidForm) }),
			);
			const missing = await invoke(
				actions.excluir,
				createRequestEvent({ locals: { user: adminUser, session: null }, request: createRequest(missingForm) }),
			);
			await db.insert(exemplar).values({ livro: dependent.idlivro, numero: 1 });
			const blocked = await invoke(
				actions.excluir,
				createRequestEvent({
					locals: { user: adminUser, session: null },
					request: createRequest(dependentForm),
				}),
			);

			expect(invalid).toMatchObject({ status: 400, data: { values: { idlivro: 'not-an-id' } } });
			expect(missing).toMatchObject({ status: 404 });
			expect(blocked).toMatchObject({ status: 409 });
			expect(await db.select().from(livro).where(eq(livro.idlivro, dependent.idlivro))).toHaveLength(1);
		} finally {
			await db.delete(exemplar).where(eq(exemplar.livro, dependent.idlivro));
			await db.delete(livro).where(eq(livro.idlivro, dependent.idlivro));
		}
	});
});
