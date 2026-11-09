import { palestranteFotos, palestras } from '#lib/server/database/schema.js';
import type { PublicTalkCard, TalkCard } from '#lib/talks/types.js';
import { readBahiaClock, readBahiaIsoDate } from '#lib/utils/date.js';
import { and, asc, eq, gt, gte, isNotNull, lt, or, sql } from 'drizzle-orm';

import type { MonthRange } from './palestra-program';
import { selectTalkCards, toTalkCard, type TalkReader } from './palestra-projections';

export type PublicTalkMoment = { today: string; now: string };

const TALK_SHOWN_AFTER_START_MINUTES = 120;
const MS_PER_MINUTE = 60_000;

export const readUpcomingTalkCutoff = (reference: Date): PublicTalkMoment => {
	const cutoff = new Date(reference.getTime() - TALK_SHOWN_AFTER_START_MINUTES * MS_PER_MINUTE);
	return { today: readBahiaIsoDate(cutoff), now: readBahiaClock(cutoff) };
};

export const isUpcomingPublicTalk = ({ data, horario }: PublicTalkCard, { today, now }: PublicTalkMoment) =>
	data > today || (data === today && horario >= now);

const toPublicTalkCard = (talk: TalkCard): PublicTalkCard => ({
	id: talk.id,
	data: talk.data,
	horario: talk.horario,
	titulo: talk.titulo,
	observacoes: talk.observacoes,
	local: talk.local,
	reuniaoCom: talk.reuniaoCom,
	palestrante: talk.palestrante && { nome: talk.palestrante.nome, temFoto: talk.palestrante.temFoto },
});

const isReadyTalk = () => and(isNotNull(palestras.palestranteId), sql`btrim(${palestras.titulo}) <> ''`);

const isUpcomingTalk = ({ today, now }: PublicTalkMoment) =>
	or(gt(palestras.data, today), and(eq(palestras.data, today), gte(palestras.horario, now)));

const talkOrder = () => [asc(palestras.data), asc(palestras.horario), asc(palestras.id)];

export const listUpcomingPublicTalks = async (database: TalkReader, moment: PublicTalkMoment, limit: number) => {
	const rows = await selectTalkCards(database)
		.where(and(isReadyTalk(), isUpcomingTalk(moment)))
		.orderBy(...talkOrder())
		.limit(limit);

	return rows.map(toTalkCard).map(toPublicTalkCard);
};

export const listMonthPublicTalks = async (database: TalkReader, { firstDay, nextMonthFirstDay }: MonthRange) => {
	const rows = await selectTalkCards(database)
		.where(and(isReadyTalk(), gte(palestras.data, firstDay), lt(palestras.data, nextMonthFirstDay)))
		.orderBy(...talkOrder());

	return rows.map(toTalkCard).map(toPublicTalkCard);
};

export const findPublicTalkSpeakerPhoto = async (database: TalkReader, talkId: number, firstPublicDay: string) => {
	const [row] = await database
		.select({ photo: palestranteFotos.quadrada })
		.from(palestras)
		.innerJoin(palestranteFotos, eq(palestranteFotos.palestranteId, palestras.palestranteId))
		.where(and(eq(palestras.id, talkId), isReadyTalk(), gte(palestras.data, firstPublicDay)))
		.limit(1);

	return row === undefined ? null : new Uint8Array(row.photo);
};
