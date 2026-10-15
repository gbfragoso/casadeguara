import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeDatabase } from '../../../../support/fake-database';
import { expectHttpError, runHandler } from '../../../../support/handler-event';
import { describeSecretariaAccess } from '../../../../support/secretaria-access-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createSecretariaFrequenciaRegistroHandlers } =
	await import('#lib/server/secretaria/frequencia/registro-handlers.js');

const { load, actions } = createSecretariaFrequenciaRegistroHandlers();
const secretaria = { roles: 'secretaria' };
const thursdaysOfOctober = { dataInicio: '2026-10-01', dataFim: '2026-10-08', dias: ['4'] };
const attendance = { '5': '2026-10-01' };

const failingDatabase = () => {
	vi.spyOn(console, 'error').mockImplementation(() => undefined);
	fakeDatabase.failWith(new Error('database offline'));
};

afterEach(() => {
	fakeDatabase.reset();
	vi.restoreAllMocks();
});

describe('createSecretariaFrequenciaRegistroHandlers', () => {
	describeSecretariaAccess(load, actions);

	it('lists the workers with the full dates of the selected weekdays', async () => {
		fakeDatabase.resolveWith([{ id: 5, nome: 'Maria' }]);

		const { result } = await runHandler(actions.pesquisar, { ...secretaria, form: thursdaysOfOctober });

		expect(result).toEqual({
			leitores: [{ id: 5, nome: 'Maria' }],
			fulldates: ['2026-10-01', '2026-10-08'],
			datas: ['01', '08'],
		});
	});

	it('fails when the workers cannot be read', async () => {
		failingDatabase();

		const { error } = await expectHttpError(actions.pesquisar, { ...secretaria, form: thursdaysOfOctober });

		expect(error.status).toBe(500);
	});

	it('records the attendance of each worker', async () => {
		const { result } = await runHandler(actions.registrar, { ...secretaria, form: attendance });

		expect(result).toEqual({ status: 201 });
		expect(fakeDatabase.argumentsOf('values')).toEqual([
			[{ trabalhador: 5, dataPresenca: new Date('2026-10-01') }],
		]);
	});

	it('fails when the attendance cannot be recorded', async () => {
		failingDatabase();

		const { error } = await expectHttpError(actions.registrar, { ...secretaria, form: attendance });

		expect(error.status).toBe(500);
	});
});
