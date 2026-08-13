import { describe, expect, it } from 'vitest';

import { CADASTRO_FETCH_LIMIT, WORKER_CADASTRO_FETCH_LIMIT } from '$lib/server/models/cadastro-reader';

import { createTestName, model, withBibliotecaCadastros } from './test-support';

describe('CadastroModel searches', () => {
	it('matches accented prefixes without case sensitivity and orders every dashboard by unaccented name', async () => {
		const prefix = createTestName('ordem');
		const names = [`${prefix}\u00c7ac`, `${prefix}\u00c1lvaro`, `${prefix}Bruno`];
		const expected = [names[1], names[2], names[0]];

		await withBibliotecaCadastros(
			names.map((nome) => ({ nome, trab: true })),
			async () => {
				const [biblioteca, secretaria, tesouraria] = await Promise.all([
					model.fetchBiblioteca(prefix.toLowerCase()),
					model.fetchSecretaria(prefix.toLowerCase(), true),
					model.fetchTesouraria(prefix.toLowerCase()),
				]);

				expect(biblioteca.map(({ nome }) => nome)).toEqual(expected);
				expect(secretaria.map(({ nome }) => nome)).toEqual(expected);
				expect(tesouraria.map(({ nome }) => nome)).toEqual(expected);
			},
		);
	});

	it('returns matching records for an empty search', async () => {
		const name = `!${createTestName('vazio')}`;

		await withBibliotecaCadastros([{ nome: name }], async ([created]) => {
			const [biblioteca, secretaria, tesouraria] = await Promise.all([
				model.fetchBiblioteca(''),
				model.fetchSecretaria('', false),
				model.fetchTesouraria(''),
			]);

			expect(biblioteca).toContainEqual({
				idleitor: created.idleitor,
				nome: name,
				trab: false,
				status: true,
			});
			expect(secretaria).toContainEqual({
				idleitor: created.idleitor,
				nome: name,
				trab: false,
				frequencia: false,
				desencarnado: false,
			});
			expect(tesouraria).toContainEqual({ idleitor: created.idleitor, nome: name, telefone: null, trab: false });
		});
	});

	it('applies the documented dashboard search limits', async () => {
		const prefix = createTestName('limite');
		const inputs = Array.from({ length: WORKER_CADASTRO_FETCH_LIMIT + 1 }, (_, index) => ({
			nome: `${prefix}${index}`,
			trab: true,
		}));

		await withBibliotecaCadastros(inputs, async () => {
			const [biblioteca, secretaria, workers, tesouraria] = await Promise.all([
				model.fetchBiblioteca(prefix),
				model.fetchSecretaria(prefix, false),
				model.fetchSecretaria(prefix, true),
				model.fetchTesouraria(prefix),
			]);

			expect(biblioteca).toHaveLength(CADASTRO_FETCH_LIMIT);
			expect(secretaria).toHaveLength(CADASTRO_FETCH_LIMIT);
			expect(workers).toHaveLength(WORKER_CADASTRO_FETCH_LIMIT);
			expect(tesouraria).toHaveLength(CADASTRO_FETCH_LIMIT);
		});
	});
});
