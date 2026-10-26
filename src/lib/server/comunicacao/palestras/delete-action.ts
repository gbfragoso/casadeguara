import { requireComunicacaoAdminAccess } from '#lib/server/authorization/comunicacao.js';
import type { PalestraModel } from '#lib/server/models/palestra.js';
import { talkDeleteSchema } from '#lib/validation/comunicacao/palestras.js';

import type { TalkActionContext } from './access';
import { rejectInvalidInput, rejectTalk, runTalkOperation } from './failures';

type DeleteDependencies = { talks: Pick<PalestraModel, 'remove'> };

export const createTalkDeleteAction =
	({ talks }: DeleteDependencies) =>
	async ({ locals, request }: TalkActionContext) => {
		requireComunicacaoAdminAccess(locals.user);

		const form = await request.formData();
		const parsed = talkDeleteSchema.safeParse({ id: form.get('id') });
		if (!parsed.success) return rejectInvalidInput('excluir', parsed.error);
		const palestraId = parsed.data.id;

		const removed = await runTalkOperation('excluir', () => talks.remove(palestraId), palestraId);
		if (!removed) return rejectTalk('excluir', 'inexistente', { palestraId });

		return { operacao: 'excluir' as const, palestraId };
	};
