import type { TestDatabase } from './cadastros-database';

export type TalkSeed = { titulo: string; data: string; horario: string };
export type TalkSnapshot = TalkSeed & { id: number; versao: number };

const BASE_MONDAY = Date.UTC(2100, 0, 4);
const DAY_MS = 86_400_000;
const WEEKS_PER_WINDOW = 4;
const DAYS_PER_WEEK = 7;
const TALK_WINDOWS = 4_000;
const TOKEN_HEX_DIGITS = 6;
const HEXADECIMAL = 16;
const ISO_DATE_LENGTH = 10;

/** Each test token owns a four-week window starting on a Monday, so parallel swaps never share a range. */
export const createTalkCalendar = (token: string) => {
	const window = Number.parseInt(token.slice(0, TOKEN_HEX_DIGITS), HEXADECIMAL) % TALK_WINDOWS;
	const monday = BASE_MONDAY + window * WEEKS_PER_WINDOW * DAYS_PER_WEEK * DAY_MS;
	return (offsetDays: number) => new Date(monday + offsetDays * DAY_MS).toISOString().slice(0, ISO_DATE_LENGTH);
};

export const insertTalks = (database: TestDatabase, seeds: readonly TalkSeed[], actorId: string) =>
	database<TalkSnapshot[]>`
		insert into palestras ${database(seeds.map((seed) => ({ ...seed, user_cadastro: actorId })))}
		returning id, titulo, data::text as data, to_char(horario, 'HH24:MI') as horario, versao
	`;

export const readTalks = (database: TestDatabase, ids: readonly number[]) =>
	database<TalkSnapshot[]>`
		select id, titulo, data::text as data, to_char(horario, 'HH24:MI') as horario, versao
		from palestras where id = any(${ids}) order by id
	`;

export const deleteTalksBy = (database: TestDatabase, actorIds: readonly string[]) =>
	database`delete from palestras where user_cadastro = any(${actorIds})`;
