import { describe, expect, it } from 'vitest';

import { createBiblioteca, createTestName, deleteCadastro, model, withBibliotecaCadastros } from './test-support';

describe('CadastroModel projections', () => {
	it('returns only each dashboard list projection', async () => {
		const name = createTestName('lista');

		await withBibliotecaCadastros([{ nome: name, trab: false, status: true }], async ([created]) => {
			expect(await model.fetchBiblioteca(name)).toEqual([
				{ idleitor: created.idleitor, nome: name, trab: false, status: true },
			]);
			expect(await model.fetchSecretaria(name, false)).toEqual([
				{ idleitor: created.idleitor, nome: name, trab: false, frequencia: false, desencarnado: false },
			]);
			expect(await model.fetchTesouraria(name)).toEqual([
				{ idleitor: created.idleitor, nome: name, telefone: null, trab: false },
			]);
		});
	});

	it('returns only biblioteca detail fields', async () => {
		const name = createTestName('biblioteca');
		const created = await createBiblioteca({ nome: name, rg: '123456789', cpf: '12345678909', status: false });

		try {
			expect(await model.getBiblioteca(created.idleitor)).toEqual({
				nome: name,
				rg: '123456789',
				cpf: '12345678909',
				email: null,
				celular: null,
				telefone: null,
				logradouro: null,
				bairro: null,
				complemento: null,
				cidade: null,
				cep: null,
				trab: false,
				status: false,
			});
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('returns only secretaria and tesouraria detail fields', async () => {
		const name = createTestName('detalhe');

		await withBibliotecaCadastros([{ nome: name, telefone: '7133333333', trab: true }], async ([created]) => {
			expect(await model.getSecretaria(created.idleitor)).toEqual({
				nome: name,
				rg: null,
				cpf: null,
				email: null,
				celular: null,
				telefone: '7133333333',
				logradouro: null,
				bairro: null,
				complemento: null,
				cidade: null,
				cep: null,
				aniversario: null,
				trab: true,
			});
			expect(await model.getTesouraria(created.idleitor)).toEqual({
				nome: name,
				telefone: '7133333333',
				trab: true,
			});
		});
	});

	it('returns undefined for a missing dashboard detail', async () => {
		expect(await model.getBiblioteca(-1)).toBeUndefined();
		expect(await model.getSecretaria(-1)).toBeUndefined();
		expect(await model.getTesouraria(-1)).toBeUndefined();
	});
});
