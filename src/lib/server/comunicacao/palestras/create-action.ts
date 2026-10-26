import { requireComunicacaoAccess } from '#lib/server/authorization/comunicacao.js';
import type { PalestraModel } from '#lib/server/models/palestra.js';
import { talkCreateSchema } from '#lib/validation/comunicacao/palestras.js';

import { acceptsDate, readTalkRules, type TalkActionContext } from './access';
import { rejectInvalidInput, rejectSpeaker, rejectTalk, runTalkOperation } from './failures';

type CreateDependencies = { talks: Pick<PalestraModel, 'create'>; today: () => string };

const readCreateForm = (form: FormData) => ({
	data: form.get('data'),
	horario: form.get('horario'),
	titulo: form.get('titulo'),
	palestranteId: form.get('palestranteId'),
	novoPalestrante: form.get('novoPalestrante'),
	observacoes: form.get('observacoes'),
	local: form.get('local'),
	reuniaoCom: form.get('reuniaoCom'),
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

		const outcome = await runTalkOperation('criar', () => talks.create(parsed.data, user.id));
		if (outcome.status !== 'created') return rejectSpeaker('criar', outcome.status);
		return { operacao: 'criar' as const, palestraId: outcome.id };
	};
