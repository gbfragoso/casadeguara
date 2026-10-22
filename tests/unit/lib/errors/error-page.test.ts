import { describe, expect, it } from 'vitest';

import { describeErrorMessage, isServerFailure } from '#lib/errors/error-page.js';

describe('describeErrorMessage', () => {
	it('keeps a message written by the application', () => {
		const message = describeErrorMessage(404, 'Autor não encontrado.');

		expect(message).toBe('Autor não encontrado.');
	});

	it.each([
		[500, 'Internal Error', 'Ocorreu um erro inesperado. Tente novamente em instantes.'],
		[404, 'Not Found', 'Página não encontrada'],
		[403, 'Forbidden', 'Você não tem permissão para acessar esta página.'],
		[401, 'Unauthorized', 'Sua sessão terminou. Entre novamente para continuar.'],
	])('replaces the framework default for status %i with Portuguese copy', (status, frameworkMessage, expected) => {
		const message = describeErrorMessage(status, frameworkMessage);

		expect(message).toBe(expected);
	});

	it.each([
		[503, 'Ocorreu um erro inesperado. Tente novamente em instantes.'],
		[422, 'Não foi possível concluir a solicitação.'],
	])('explains status %i when the error has no message', (status, expected) => {
		const message = describeErrorMessage(status, '  ');

		expect(message).toBe(expected);
	});
});

describe('isServerFailure', () => {
	it.each([
		[500, true],
		[503, true],
		[404, false],
	])('classifies status %i as a server failure: %s', (status, expected) => {
		expect(isServerFailure(status)).toBe(expected);
	});
});
