import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeDatabase } from '../../../../support/fake-database';
import { expectHttpError, runHandler } from '../../../../support/handler-event';
import { describeSecretariaAccess } from '../../../../support/secretaria-access-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createSecretariaAniversariantesHandlers } =
	await import('#lib/server/secretaria/aniversariantes/page-handlers.js');

const { load, actions } = createSecretariaAniversariantesHandlers();
const workers = [{ nome: 'Maria', aniversario: '1980-10-02', desencarnado: false }];

afterEach(() => {
	fakeDatabase.reset();
	vi.restoreAllMocks();
});

describe('createSecretariaAniversariantesHandlers', () => {
	describeSecretariaAccess(load, actions);

	it.each([
		['of the selected month', { mes: '10' }, '10'],
		['of every month', {}, null],
	])('lists the workers birthdays %s with the searched month', async (_scenario, form, mes) => {
		fakeDatabase.resolveWith(workers);

		const { result } = await runHandler(actions.default, { roles: 'secretaria', form });

		expect(result).toEqual({ leitores: workers, mes });
	});

	it('fails when the birthdays cannot be read', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		fakeDatabase.failWith(new Error('database offline'));

		const { error } = await expectHttpError(actions.default, { roles: 'secretaria', form: { mes: '10' } });

		expect(error.status).toBe(500);
	});
});
