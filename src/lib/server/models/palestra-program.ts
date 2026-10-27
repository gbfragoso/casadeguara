import { palestrantes, palestras } from '#lib/server/database/schema.js';
import type { ProgramTalkSource } from '#lib/server/pdf/talk-program/content.js';
import { and, asc, eq, gte, lt } from 'drizzle-orm';

import { toClockTime, type TalkReader } from './palestra-projections';

export type MonthRange = { firstDay: string; nextMonthFirstDay: string };

const programFields = {
	id: palestras.id,
	data: palestras.data,
	horario: palestras.horario,
	titulo: palestras.titulo,
	observacoes: palestras.observacoes,
	local: palestras.local,
	palestranteNome: palestrantes.nome,
};

const selectMonthProgram = (database: TalkReader, { firstDay, nextMonthFirstDay }: MonthRange) =>
	database
		.select(programFields)
		.from(palestras)
		.leftJoin(palestrantes, eq(palestrantes.id, palestras.palestranteId))
		.where(and(gte(palestras.data, firstDay), lt(palestras.data, nextMonthFirstDay)))
		.orderBy(asc(palestras.data), asc(palestras.horario), asc(palestras.id));

type ProgramRow = Awaited<ReturnType<typeof selectMonthProgram>>[number];

const toProgramTalkSource = ({ palestranteNome, horario, ...talk }: ProgramRow): ProgramTalkSource => ({
	...talk,
	horario: toClockTime(horario),
	palestrante: palestranteNome === null ? null : { nome: palestranteNome },
});

export const listMonthProgram = async (database: TalkReader, range: MonthRange): Promise<ProgramTalkSource[]> => {
	const rows = await selectMonthProgram(database, range);
	return rows.map(toProgramTalkSource);
};
