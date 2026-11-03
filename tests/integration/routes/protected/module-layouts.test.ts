import { describe, expect, it } from 'vitest';

import { createRequestEvent, invoke } from '../../support/request-event';
import { load as loadBiblioteca } from '../../../../src/routes/(protected)/biblioteca/+layout.server';
import { load as loadComunicacao } from '../../../../src/routes/(protected)/comunicacao/+layout.server';
import { load as loadSecretaria } from '../../../../src/routes/(protected)/secretaria/+layout.server';
import { load as loadTesouraria } from '../../../../src/routes/(protected)/tesouraria/+layout.server';

const UNAUTHORIZED = 401;
const FORBIDDEN = 403;

const superuser = { id: 'superuser-1', username: 'ana@exemplo.dev', name: 'Ana', roles: 'superuser' };

describe('TI-13 module layouts', () => {
	it.each([
		['Biblioteca', loadBiblioteca, UNAUTHORIZED],
		['Secretaria', loadSecretaria, UNAUTHORIZED],
		['Tesouraria', loadTesouraria, FORBIDDEN],
		['Comunicação', loadComunicacao, FORBIDDEN],
	])('refuses %s to a user with only the superuser role', async (_module, load, status) => {
		const event = createRequestEvent({ locals: { user: superuser, session: null } });

		const outcome = await Promise.resolve()
			.then(() => invoke(load, event))
			.catch((reason: unknown) => reason);

		expect(outcome).toMatchObject({ status });
	});
});
