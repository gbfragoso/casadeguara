import { requireComunicacaoAccess } from '#lib/server/authorization/comunicacao.js';
import type { PalestraModel } from '#lib/server/models/palestra.js';
import type { TalkMoveOutcome } from '#lib/server/models/palestra-move.js';
import { talkMoveSchema, type TalkMoveRequest } from '#lib/validation/comunicacao/palestras.js';

import type { TalkActionContext } from './access';
import { rejectConflict, rejectInvalidInput, runTalkOperation } from './failures';

type MoveDependencies = { talks: Pick<PalestraModel, 'move'>; today: () => string };
type CompletedMove = Exclude<TalkMoveOutcome, { status: 'conflict' }>;

const readMoveForm = (form: FormData) => ({
	origemId: form.get('origemId'),
	destinoId: form.get('destinoId'),
	ids: form.getAll('ids'),
	versoes: form.getAll('versoes'),
});

const logMove = (move: TalkMoveRequest, outcome: CompletedMove, actorId: string, startedAt: number) =>
	console.info('comunicacao.palestras.movida', {
		origemId: move.originId,
		destinoId: move.targetId,
		tamanhoTrecho: move.range.length,
		status: outcome.status,
		actorId,
		duracaoMs: performance.now() - startedAt,
	});

export const createTalkMoveAction =
	({ talks, today }: MoveDependencies) =>
	async ({ locals, request }: TalkActionContext) => {
		const user = requireComunicacaoAccess(locals.user);

		const parsed = talkMoveSchema.safeParse(readMoveForm(await request.formData()));
		if (!parsed.success) return rejectInvalidInput('mover', parsed.error);
		const move = parsed.data;

		const startedAt = performance.now();
		const outcome = await runTalkOperation('mover', () => talks.move(move, today(), user.id), move.originId);
		if (outcome.status === 'conflict') return rejectConflict('mover', move.originId, user.id);

		logMove(move, outcome, user.id, startedAt);
		return { operacao: 'mover' as const, palestraId: move.originId, status: outcome.status, slot: outcome.slot };
	};
