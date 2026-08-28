import { describe, expect, it } from 'vitest';

import {
	InternalServerError,
	NotFoundError,
	ServiceError,
	UnauthorizedError,
	ValidationError,
} from '$lib/errors/application';

describe('application errors', () => {
	it('serializes internal errors with default and explicit status codes', () => {
		const defaultError = new InternalServerError({ cause: new Error('database') });
		const explicitError = new InternalServerError({ statusCode: 502 });

		expect(defaultError.toJSON()).toMatchObject({ name: 'InternalServerError', status_code: 500 });
		expect(explicitError.toJSON()).toMatchObject({ name: 'InternalServerError', status_code: 502 });
	});

	it('serializes service errors with default and explicit messages', () => {
		const defaultError = new ServiceError({});
		const explicitError = new ServiceError({ message: 'Serviço externo indisponível.' });

		expect(defaultError.toJSON()).toMatchObject({ name: 'ServiceError', status_code: 503 });
		expect(explicitError.toJSON()).toMatchObject({ message: 'Serviço externo indisponível.' });
	});

	it('serializes validation errors with default and explicit guidance', () => {
		const defaultError = new ValidationError({ fieldErrors: { nome: ['Obrigatório'] } });
		const explicitError = new ValidationError({
			message: 'Dados inválidos.',
			action: 'Corrija o formulário.',
			fieldErrors: {},
		});

		expect(defaultError.toJSON()).toMatchObject({ name: 'ValidationError', status_code: 400 });
		expect(explicitError.toJSON()).toMatchObject({ message: 'Dados inválidos.', action: 'Corrija o formulário.' });
	});

	it('serializes not-found and unauthorized errors with default and explicit messages', () => {
		const defaultNotFound = new NotFoundError({});
		const explicitNotFound = new NotFoundError({ message: 'Cadastro não encontrado.', action: 'Revise a busca.' });
		const defaultUnauthorized = new UnauthorizedError({});
		const explicitUnauthorized = new UnauthorizedError({ message: 'Sessão expirada.', action: 'Entre novamente.' });

		expect(defaultNotFound.toJSON()).toMatchObject({ name: 'NotFoundError', status_code: 404 });
		expect(explicitNotFound.toJSON()).toMatchObject({
			message: 'Cadastro não encontrado.',
			action: 'Revise a busca.',
		});
		expect(defaultUnauthorized.toJSON()).toMatchObject({ name: 'UnauthorizedError', status_code: 401 });
		expect(explicitUnauthorized.toJSON()).toMatchObject({
			message: 'Sessão expirada.',
			action: 'Entre novamente.',
		});
	});
});
