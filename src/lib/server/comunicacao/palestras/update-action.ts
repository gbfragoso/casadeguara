import { requireComunicacaoAccess } from '#lib/server/authorization/comunicacao.js';
import type { PalestraModel } from '#lib/server/models/palestra.js';
import type { TalkUpdateOutcome } from '#lib/server/models/palestra-write.js';
import { talkChangeSchema, talkTargetSchema, type TalkChange } from '#lib/validation/comunicacao/palestras.js';

import { acceptsDate, readTalkRules, type TalkActionContext } from './access';
import { rejectConflict, rejectInvalidInput, rejectTalk, runTalkOperation, type TalkFailureCode } from './failures';

type UpdateDependencies = { talks: Pick<PalestraModel, 'update'>; today: () => string };
type UpdateRejection = Exclude<TalkUpdateOutcome['status'], 'updated'>;
type UpdateContext = { palestraId: number; campo: TalkChange['campo']; actorId: string };

const MISSING_SPEAKER_MESSAGE = 'Palestrante não encontrado.';

const REJECTION_CODES: Record<Exclude<UpdateRejection, 'conflict' | 'missing-speaker'>, TalkFailureCode> = {
	missing: 'inexistente',
	locked: 'historico-bloqueado',
	'duplicate-speaker': 'nome-duplicado',
};

const readSubmittedField = (form: FormData) => {
	const campo = form.get('campo');
	return typeof campo === 'string' ? campo : undefined;
};

const parseUpdateForm = (form: FormData) => {
	const target = talkTargetSchema.safeParse({ id: form.get('id'), versao: form.get('versao') });
	if (!target.success) return { failure: rejectInvalidInput('atualizar', target.error) };

	const change = talkChangeSchema.safeParse({ campo: form.get('campo'), valor: form.get('valor') });
	if (!change.success) {
		const details = { palestraId: target.data.id, valueField: readSubmittedField(form) };
		return { failure: rejectInvalidInput('atualizar', change.error, details) };
	}

	return { target: target.data, change: change.data };
};

const rejectOutcome = (status: UpdateRejection, { palestraId, campo, actorId }: UpdateContext) => {
	if (status === 'conflict') return rejectConflict('atualizar', palestraId, actorId);
	if (status === 'missing-speaker') {
		return rejectTalk('atualizar', 'validacao', { palestraId, campo, mensagem: MISSING_SPEAKER_MESSAGE });
	}
	return rejectTalk('atualizar', REJECTION_CODES[status], { palestraId, campo });
};

const logUpdate = (context: UpdateContext, startedAt: number) =>
	console.info('comunicacao.palestras.atualizada', { ...context, duracaoMs: performance.now() - startedAt });

export const createTalkUpdateAction =
	({ talks, today }: UpdateDependencies) =>
	async ({ locals, request }: TalkActionContext) => {
		const user = requireComunicacaoAccess(locals.user);

		const parsed = parseUpdateForm(await request.formData());
		if ('failure' in parsed) return parsed.failure;
		const { target, change } = parsed;
		const context = { palestraId: target.id, campo: change.campo, actorId: user.id };
		const rules = readTalkRules(user, today());
		if (change.campo === 'data' && !acceptsDate(rules, change.valor)) {
			return rejectTalk('atualizar', 'data-passada', { palestraId: target.id, campo: change.campo });
		}

		const startedAt = performance.now();
		const outcome = await runTalkOperation(
			'atualizar',
			() => talks.update(target, change, rules, user.id),
			target.id,
		);
		if (outcome.status !== 'updated') return rejectOutcome(outcome.status, context);

		logUpdate(context, startedAt);
		return { operacao: 'atualizar' as const, palestraId: target.id, versao: outcome.versao };
	};
