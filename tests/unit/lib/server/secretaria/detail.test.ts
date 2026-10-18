import { describe, expect, it } from 'vitest';

import { toSecretariaDetail } from '#lib/server/secretaria/detail.js';

const cadastro = {
	nome: 'MARIA',
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
	aniversario: new Date('2024-02-29T00:00:00.000Z'),
	trab: true,
	hasPhoto: true,
	photoVersion: 'v1',
};

describe('toSecretariaDetail', () => {
	it('exposes the birthday as a date-only value and the photo version', () => {
		const detail = toSecretariaDetail(cadastro);

		expect(detail).toMatchObject({ aniversario: '2024-02-29', hasPhoto: true, photoVersion: 'v1' });
	});

	it('keeps a missing birthday empty', () => {
		const detail = toSecretariaDetail({ ...cadastro, aniversario: null });

		expect(detail.aniversario).toBeNull();
	});
});
