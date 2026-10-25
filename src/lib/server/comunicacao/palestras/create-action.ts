import { requireComunicacaoAccess } from '#lib/server/authorization/comunicacao.js';
import type { PalestraModel } from '#lib/server/models/palestra.js';
import { talkCreateSchema } from '#lib/validation/comunicacao/palestras.js';

import { acceptsDate, readTalkRules, type TalkActionContext } from './access';
import { rejectInvalidInput, rejectTalk, runTalkOperation } from './failures';

type CreateDependencies = { talks: Pick<PalestraModel, 'create'>; today: () => string };

const readCreateForm = (form: FormData) => ({
	data: form.get('data'),
	horario: form.get('horario'),
	local: form.get('local'),
});

export const createTalkCreateAction =
	({ talks, today }: CreateDependencies) =>
	async ({ locals, request }: TalkActionContext) => {
		const user = requireComunicacaoAccess(locals.user);

		const parsed = talkCreateSchema.safeParse(readCreateForm(await request.formData()));
		if (!parsed.success) return rejectInvalidInput('criar', parsed.error);
		if (!acceptsDate(readTalkRules(user, today()), parsed.data.data)) {
			return rejectTalk('criar', 'data-passada', { campo: 'data' });
		}

		const created = await runTalkOperation('criar', () => talks.create(parsed.data, user.id));
		return { operacao: 'criar' as const, palestraId: created.id };
	};
