import type { db } from '#lib/server/database/connection.js';
import { palestranteFotos, palestrantes, palestras } from '#lib/server/database/schema.js';
import type { TalkCard, TalkSpeaker } from '#lib/talks/types.js';
import { eq, sql } from 'drizzle-orm';

export type TalkDatabase = typeof db;
export type TalkTransaction = Parameters<Parameters<TalkDatabase['transaction']>[0]>[0];
export type TalkReader = TalkDatabase | TalkTransaction;

const CLOCK_TIME_LENGTH = 5;

export const toClockTime = (time: string) => time.slice(0, CLOCK_TIME_LENGTH);

const talkCardFields = {
	id: palestras.id,
	data: palestras.data,
	horario: palestras.horario,
	titulo: palestras.titulo,
	observacoes: palestras.observacoes,
	local: palestras.local,
	versao: palestras.versao,
	palestranteId: palestrantes.id,
	palestranteNome: palestrantes.nome,
	palestranteTemFoto: sql<boolean>`${palestranteFotos.palestranteId} is not null`,
};

export const selectTalkCards = (database: TalkReader) =>
	database
		.select(talkCardFields)
		.from(palestras)
		.leftJoin(palestrantes, eq(palestrantes.id, palestras.palestranteId))
		.leftJoin(palestranteFotos, eq(palestranteFotos.palestranteId, palestrantes.id))
		.$dynamic();

type TalkCardRow = Awaited<ReturnType<typeof selectTalkCards>>[number];

const toTalkSpeaker = (row: TalkCardRow): TalkSpeaker | null => {
	if (row.palestranteId === null || row.palestranteNome === null) return null;
	return { id: row.palestranteId, nome: row.palestranteNome, temFoto: row.palestranteTemFoto };
};

export const toTalkCard = (row: TalkCardRow): TalkCard => ({
	id: row.id,
	data: row.data,
	horario: toClockTime(row.horario),
	titulo: row.titulo,
	observacoes: row.observacoes,
	local: row.local,
	palestrante: toTalkSpeaker(row),
	versao: row.versao,
});
