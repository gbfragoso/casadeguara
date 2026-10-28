import { error } from '@sveltejs/kit';

import { INVALID_BIRTHDAY_MONTH_MESSAGE, parseBirthdayMonth, resolveReferenceMonth } from '#lib/birthdays/months.js';
import type { CadastroModel } from '#lib/server/models/cadastro.js';
import { requireSecretariaAccess } from '#lib/server/secretaria/access.js';

type BirthdayPageDependencies = {
	birthdays: Pick<CadastroModel, 'listMonthBirthdays'>;
	today: () => string;
};
type User = { id: string; roles: string } | null;
type ActionContext = { locals: { user: User }; request: Request };

const readBirthdays = async (birthdays: BirthdayPageDependencies['birthdays'], month: number) => {
	try {
		return await birthdays.listMonthBirthdays(month);
	} catch (cause) {
		console.error(cause);
		error(500, 'Falha ao carregar a lista de leitores');
	}
};

export const createSecretariaAniversariantesHandlers = ({ birthdays, today }: BirthdayPageDependencies) => ({
	load: async ({ locals }: Pick<ActionContext, 'locals'>) => {
		requireSecretariaAccess(locals.user);
		return { hoje: today() };
	},
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			requireSecretariaAccess(locals.user);
			const option = parseBirthdayMonth((await request.formData()).get('mes'));
			if (!option) error(400, INVALID_BIRTHDAY_MONTH_MESSAGE);

			const { year } = resolveReferenceMonth(option.month, today());
			const leitores = await readBirthdays(birthdays, option.month);
			return { leitores, mes: option.value, ano: year };
		},
	},
});
