import { describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/database/connection';
import { autor, cadastros, editora, keyword, serie } from '$lib/server/database/schema';
import { cadastroModel } from '$lib/server/models/cadastro';
import { bibliotecaCreateActions } from '../../../support/biblioteca-route-actions';
import { bibliotecaUser } from '../../../support/auth';
import { createTestName } from '../../../lib/server/models/cadastro/test-support';
import { createRequestEvent, invoke } from '../../../support/request-event';

const createEvent = (field: string, value: string) => {
	const form = new FormData();
	form.set(field, value);

	return createRequestEvent({
		locals: { user: bibliotecaUser, session: null },
		request: new Request('http://localhost/', { method: 'POST', body: form }),
	});
};

describe('TI-07 biblioteca create actions', () => {
	it('commits each authorized create action to its owning table', async () => {
		const scenarios = [
			{ action: bibliotecaCreateActions[0], field: 'nome', table: autor, column: autor.nome },
			{ action: bibliotecaCreateActions[1], field: 'nome', table: serie, column: serie.nome },
			{ action: bibliotecaCreateActions[2], field: 'nome', table: editora, column: editora.nome },
			{ action: bibliotecaCreateActions[3], field: 'chave', table: keyword, column: keyword.chave },
		];

		for (const { action, field, table, column } of scenarios) {
			const expected = (
				field === 'chave' ? createTestName('k').slice(0, 20) : createTestName(`route-create-${field}`)
			).toLocaleUpperCase('pt-BR');
			const result = await invoke(action, createEvent(field, expected));
			const [created] = await db.select().from(table).where(eq(column, expected));

			try {
				expect(result).toEqual({ status: 201 });
				expect(created).toBeDefined();
			} finally {
				if (created) await db.delete(table).where(eq(column, expected));
			}
		}
	});

	it('commits a new reader with only its required name', async () => {
		const expected = createTestName('route-reader-create').toLocaleUpperCase('pt-BR');
		const result = await invoke(bibliotecaCreateActions[4], createEvent('nome', expected));
		const duplicate = await invoke(bibliotecaCreateActions[4], createEvent('nome', expected));
		const [created] = await db
			.select({ id: cadastros.idleitor })
			.from(cadastros)
			.where(eq(cadastros.nome, expected));

		try {
			expect(result).toEqual({ status: 201 });
			expect(duplicate).toMatchObject({ status: 400 });
			expect(created).toBeDefined();
		} finally {
			if (created) await db.delete(cadastros).where(eq(cadastros.idleitor, created.id));
		}
	});

	it('maps an unexpected reader persistence failure to an internal error', async () => {
		const failure = vi.spyOn(cadastroModel, 'createBiblioteca').mockRejectedValue(new Error('database'));

		try {
			await expect(
				invoke(bibliotecaCreateActions[4], createEvent('nome', createTestName('route-reader-failure'))),
			).rejects.toMatchObject({
				status: 500,
			});
		} finally {
			failure.mockRestore();
		}
	});
});
