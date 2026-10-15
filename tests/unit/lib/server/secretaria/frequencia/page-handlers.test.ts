import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeDatabase } from '../../../../support/fake-database';
import { expectHttpError, runHandler } from '../../../../support/handler-event';
import { describeSecretariaAccess } from '../../../../support/secretaria-access-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createSecretariaFrequenciaHandlers } = await import('#lib/server/secretaria/frequencia/page-handlers.js');

const { load, actions } = createSecretariaFrequenciaHandlers();
const thursdaysOfOctober = { dataInicio: '2026-10-01', dataFim: '2026-10-08', dias: ['4'] };

afterEach(() => {
	fakeDatabase.reset();
	vi.restoreAllMocks();
});

describe('createSecretariaFrequenciaHandlers', () => {
	describeSecretariaAccess(load, actions);

	it('lists the workers with the days of the selected weekdays', async () => {
		fakeDatabase.resolveWith([{ nome: 'Maria', desencarnado: false }]);

		const { result } = await runHandler(actions.default, { roles: 'secretaria', form: thursdaysOfOctober });

		expect(result).toEqual({ leitores: [{ nome: 'Maria', desencarnado: false }], datas: ['01', '08'] });
	});

	it('fails when the workers cannot be read', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		fakeDatabase.failWith(new Error('database offline'));

		const { error } = await expectHttpError(actions.default, { roles: 'secretaria', form: thursdaysOfOctober });

		expect(error.status).toBe(500);
	});
});
