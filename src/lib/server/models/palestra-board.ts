import { palestras } from '#lib/server/database/schema.js';
import type { WeekdayTimes } from '#lib/talks/types.js';
import type { IsoWeekday } from '#lib/utils/date.js';
import { asc, desc, gte, lt, sql } from 'drizzle-orm';

import { selectTalkCards, toClockTime, toTalkCard, type TalkReader } from './palestra-projections';

export const HISTORY_PAGE_SIZE = 20;

const EMPTY_WEEKDAY_TIMES: WeekdayTimes = { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null };

export const listAgenda = async (database: TalkReader, today: string) => {
	const rows = await selectTalkCards(database)
		.where(gte(palestras.data, today))
		.orderBy(asc(palestras.data), asc(palestras.horario), asc(palestras.id));

	return rows.map(toTalkCard);
};

export const listHistory = async (database: TalkReader, today: string, page: number) => {
	const rows = await selectTalkCards(database)
		.where(lt(palestras.data, today))
		.orderBy(desc(palestras.data), desc(palestras.horario), desc(palestras.id))
		.limit(HISTORY_PAGE_SIZE + 1)
		.offset((page - 1) * HISTORY_PAGE_SIZE);

	return { rows: rows.slice(0, HISTORY_PAGE_SIZE).map(toTalkCard), hasNext: rows.length > HISTORY_PAGE_SIZE };
};

export const suggestTimes = async (database: TalkReader): Promise<WeekdayTimes> => {
	const isoWeekday = sql<IsoWeekday>`extract(isodow from ${palestras.data})::int`;
	const latestByWeekday = await database
		.selectDistinctOn([isoWeekday], { weekday: isoWeekday, horario: palestras.horario })
		.from(palestras)
		.orderBy(isoWeekday, desc(palestras.data), desc(palestras.dataCadastro), desc(palestras.id));

	return latestByWeekday.reduce(
		(times, { weekday, horario }) => ({ ...times, [weekday]: toClockTime(horario) }),
		EMPTY_WEEKDAY_TIMES,
	);
};
