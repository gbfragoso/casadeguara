import { palestras } from '#lib/server/database/schema.js';
import type { TalkChange, TalkCreateData, TalkTarget } from '#lib/validation/comunicacao/palestras.js';
import { eq, sql } from 'drizzle-orm';

import { DuplicatePalestranteNameError, isTalkSpeakerReferenceViolation } from './palestrante-error';
import { createSpeaker } from './palestrante-write';
import type { TalkDatabase, TalkTransaction } from './palestra-projections';

const AGENDA_LOCK_KEY = 'casadeguara.comunicacao.palestras.agenda';

export type TalkRules = { today: string; allowPast: boolean };
export type SpeakerRejection = 'duplicate-speaker' | 'missing-speaker';
type TalkRejection = 'missing' | 'conflict' | 'locked' | SpeakerRejection;
export type TalkUpdateOutcome = { status: 'updated'; versao: number } | { status: TalkRejection };
export type TalkCreateOutcome = { status: 'created'; id: number } | { status: SpeakerRejection };

export const lockAgenda = (transaction: TalkTransaction) =>
	transaction.execute(sql`select pg_advisory_xact_lock(hashtextextended(${AGENDA_LOCK_KEY}, 0))`);

const translateSpeakerFailure = (error: unknown): { status: SpeakerRejection } => {
	if (error instanceof DuplicatePalestranteNameError) return { status: 'duplicate-speaker' };
	if (isTalkSpeakerReferenceViolation(error)) return { status: 'missing-speaker' };
	throw error;
};

const resolveSpeakerId = async (transaction: TalkTransaction, input: TalkCreateData, actorId: string) =>
	input.novoPalestrante ? (await createSpeaker(transaction, input.novoPalestrante, actorId)).id : input.palestranteId;

const insertTalk = async (transaction: TalkTransaction, input: TalkCreateData, actorId: string) => {
	await lockAgenda(transaction);
	const { data, horario, titulo, observacoes, local, reuniaoCom } = input;
	const palestranteId = await resolveSpeakerId(transaction, input, actorId);
	const [created] = await transaction
		.insert(palestras)
		.values({ data, horario, titulo, observacoes, local, reuniaoCom, palestranteId, userCadastro: actorId })
		.returning({ id: palestras.id });
	return { status: 'created' as const, id: created.id };
};

export const createTalk = (
	database: TalkDatabase,
	input: TalkCreateData,
	actorId: string,
): Promise<TalkCreateOutcome> =>
	database.transaction((transaction) => insertTalk(transaction, input, actorId)).catch(translateSpeakerFailure);

export const removeTalk = (database: TalkDatabase, id: number) =>
	database.transaction(async (transaction) => {
		await lockAgenda(transaction);
		const removed = await transaction.delete(palestras).where(eq(palestras.id, id)).returning({ id: palestras.id });
		return removed.length > 0;
	});

const changesAgendaOrder = (change: TalkChange) => change.campo === 'data' || change.campo === 'horario';

const toColumnValues = async (transaction: TalkTransaction, change: TalkChange, actorId: string) => {
	switch (change.campo) {
		case 'titulo':
			return { titulo: change.valor };
		case 'observacoes':
			return { observacoes: change.valor };
		case 'local':
			return { local: change.valor };
		case 'reuniaoCom':
			return { reuniaoCom: change.valor };
		case 'palestranteId':
			return { palestranteId: change.valor };
		case 'novoPalestrante':
			return { palestranteId: (await createSpeaker(transaction, change.valor, actorId)).id };
		case 'data':
			return { data: change.valor };
		case 'horario':
			return { horario: change.valor };
	}
};

type CurrentTalk = { data: string; versao: number } | undefined;

const findRejection = (current: CurrentTalk, target: TalkTarget, rules: TalkRules): TalkRejection | undefined => {
	if (current === undefined) return 'missing';
	if (current.versao !== target.versao) return 'conflict';
	if (!rules.allowPast && current.data < rules.today) return 'locked';
};

const updateInTransaction = async (
	transaction: TalkTransaction,
	target: TalkTarget,
	change: TalkChange,
	rules: TalkRules,
	actorId: string,
): Promise<TalkUpdateOutcome> => {
	if (changesAgendaOrder(change)) await lockAgenda(transaction);
	const [current] = await transaction
		.select({ data: palestras.data, versao: palestras.versao })
		.from(palestras)
		.where(eq(palestras.id, target.id))
		.for('update');
	const rejection = findRejection(current, target, rules);
	if (rejection) return { status: rejection };
	const [updated] = await transaction
		.update(palestras)
		.set({
			...(await toColumnValues(transaction, change, actorId)),
			versao: sql`${palestras.versao} + 1`,
			userAlteracao: actorId,
			dataAlteracao: new Date(),
		})
		.where(eq(palestras.id, target.id))
		.returning({ versao: palestras.versao });
	return { status: 'updated', versao: updated.versao };
};

export const updateTalk = (
	database: TalkDatabase,
	target: TalkTarget,
	change: TalkChange,
	rules: TalkRules,
	actorId: string,
) =>
	database
		.transaction((transaction) => updateInTransaction(transaction, target, change, rules, actorId))
		.catch(translateSpeakerFailure);
