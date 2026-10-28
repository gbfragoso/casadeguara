import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BirthdaySource } from '#lib/server/models/cadastro-birthdays.js';
import type { CadastroModel } from '#lib/server/models/cadastro.js';
import { createSecretariaAniversariantesHandlers } from '#lib/server/secretaria/aniversariantes/page-handlers.js';
import { expectHttpError, runHandler } from '../../../../support/handler-event';
import { describeSecretariaAccess } from '../../../../support/secretaria-access-suite';

const TODAY = '2026-10-27';
const INVALID_MONTH_MESSAGE = 'Escolha um mês de janeiro a dezembro.';
const people: BirthdaySource[] = [{ id: 31, nome: 'Maria', dia: 15, desencarnado: false }];

const createHandlers = (listMonthBirthdays = vi.fn<CadastroModel['listMonthBirthdays']>(async () => people)) => ({
	listMonthBirthdays,
	...createSecretariaAniversariantesHandlers({ birthdays: { listMonthBirthdays }, today: () => TODAY }),
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('createSecretariaAniversariantesHandlers', () => {
	const { load, actions } = createHandlers();
	describeSecretariaAccess(load, actions, { hoje: TODAY });

	it('TU-21 lists the birthdays of the month with the reference year', async () => {
		const { actions, listMonthBirthdays } = createHandlers();

		const { result } = await runHandler(actions.default, { roles: 'secretaria', form: { mes: '01' } });

		expect(result).toEqual({ leitores: people, mes: '01', ano: 2027 });
		expect(listMonthBirthdays).toHaveBeenCalledWith(1);
	});

	it.each([
		['without a month', {}],
		['with month 13', { mes: '13' }],
	])('TU-22 rejects a request %s without reading the birthdays', async (_scenario, form) => {
		const { actions, listMonthBirthdays } = createHandlers();

		const { error } = await expectHttpError(actions.default, { roles: 'secretaria', form });

		expect(error).toMatchObject({ status: 400, body: { message: INVALID_MONTH_MESSAGE } });
		expect(listMonthBirthdays).not.toHaveBeenCalled();
	});

	it('TU-23 fails when the birthdays cannot be read', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const { actions } = createHandlers(vi.fn(() => Promise.reject(new Error('database offline'))));

		const { error } = await expectHttpError(actions.default, { roles: 'secretaria', form: { mes: '10' } });

		expect(error).toMatchObject({ status: 500, body: { message: 'Falha ao carregar a lista de leitores' } });
	});
});
