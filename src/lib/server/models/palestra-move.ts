import { palestras } from '#lib/server/database/schema.js';
import { planSlotMove, type SlottedTalk, type TalkSlot } from '#lib/talks/slot-move.js';
import type { TalkMoveRequest } from '#lib/validation/comunicacao/palestras.js';
import { and, asc, count, eq, inArray, sql } from 'drizzle-orm';

import { toClockTime, type TalkDatabase, type TalkTransaction } from './palestra-projections';
import { lockAgenda } from './palestra-write';

export type TalkMoveOutcome = { status: 'moved' | 'unchanged'; slot: TalkSlot } | { status: 'conflict' };

type RangeTalk = SlottedTalk & { versao: number };
type PlannedTalk = RangeTalk & { previous: TalkSlot };

const CONFLICT = { status: 'conflict' } as const;

const lockRange = (transaction: TalkTransaction, ids: number[]) =>
	transaction
		.select({ id: palestras.id, data: palestras.data, horario: palestras.horario, versao: palestras.versao })
		.from(palestras)
		.where(inArray(palestras.id, ids))
		.orderBy(asc(palestras.data), asc(palestras.horario), asc(palestras.id))
		.for('update');

const matchesRequest = (rows: RangeTalk[], { range }: TalkMoveRequest, today: string) =>
	rows.length === range.length &&
	rows.every((row, index) => row.id === range[index].id && row.versao === range[index].versao) &&
	rows[0].data >= today;

const agendaKey = sql`(${palestras.data}, ${palestras.horario}, ${palestras.id})`;

const agendaPosition = (talk: SlottedTalk) => sql`(${talk.data}::date, ${talk.horario}::time, ${talk.id}::integer)`;

const isContiguous = async (transaction: TalkTransaction, rows: RangeTalk[]) => {
	const first = agendaPosition(rows[0]);
	const last = agendaPosition(rows[rows.length - 1]);
	const [{ total }] = await transaction
		.select({ total: count() })
		.from(palestras)
		.where(and(sql`${agendaKey} >= ${first}`, sql`${agendaKey} <= ${last}`));
	return total === rows.length;
};

const connectsRangeEnds = (originIndex: number, targetIndex: number, length: number) =>
	Math.min(originIndex, targetIndex) === 0 && Math.max(originIndex, targetIndex) === length - 1;

const hasSameSlot = (left: TalkSlot, right: TalkSlot) => left.data === right.data && left.horario === right.horario;

const updateMovedSlots = async (transaction: TalkTransaction, plan: PlannedTalk[], actorId: string) => {
	const moved = plan.filter((talk) => !hasSameSlot(talk, talk.previous));
	for (const talk of moved) {
		await transaction
			.update(palestras)
			.set({
				data: talk.data,
				horario: talk.horario,
				versao: sql`${palestras.versao} + 1`,
				userAlteracao: actorId,
				dataAlteracao: new Date(),
			})
			.where(eq(palestras.id, talk.id));
	}
	return moved.length > 0;
};

const moveInTransaction = async (
	transaction: TalkTransaction,
	request: TalkMoveRequest,
	today: string,
	actorId: string,
): Promise<TalkMoveOutcome> => {
	await lockAgenda(transaction);
	const ids = request.range.map(({ id }) => id);
	const rows = await lockRange(transaction, ids);
	if (!matchesRequest(rows, request, today)) return CONFLICT;
	const originIndex = rows.findIndex(({ id }) => id === request.originId);
	const targetIndex = rows.findIndex(({ id }) => id === request.targetId);
	if (!connectsRangeEnds(originIndex, targetIndex, rows.length)) return CONFLICT;
	if (!(await isContiguous(transaction, rows))) return CONFLICT;
	const withPreviousSlots = rows.map((row) => ({ ...row, previous: { data: row.data, horario: row.horario } }));
	const plan = planSlotMove(withPreviousSlots, originIndex, targetIndex);
	const moved = await updateMovedSlots(transaction, plan, actorId);
	const slot = { data: plan[targetIndex].data, horario: toClockTime(plan[targetIndex].horario) };
	return { status: moved ? 'moved' : 'unchanged', slot };
};

export const moveTalk = (database: TalkDatabase, request: TalkMoveRequest, today: string, actorId: string) =>
	database.transaction((transaction) => moveInTransaction(transaction, request, today, actorId));
