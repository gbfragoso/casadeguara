import { palestranteFotos, palestrantes, palestras } from '#lib/server/database/schema.js';
import type { TalkArtSource } from '#lib/server/image/talk-art/content.js';
import { eq } from 'drizzle-orm';

import { toClockTime, type TalkReader } from './palestra-projections';

const artSourceFields = {
	id: palestras.id,
	versao: palestras.versao,
	data: palestras.data,
	horario: palestras.horario,
	titulo: palestras.titulo,
	observacoes: palestras.observacoes,
	local: palestras.local,
	reuniaoCom: palestras.reuniaoCom,
	palestranteNome: palestrantes.nome,
	foto: palestranteFotos.quadrada,
};

const selectArtSource = (database: TalkReader, id: number) =>
	database
		.select(artSourceFields)
		.from(palestras)
		.leftJoin(palestrantes, eq(palestrantes.id, palestras.palestranteId))
		.leftJoin(palestranteFotos, eq(palestranteFotos.palestranteId, palestrantes.id))
		.where(eq(palestras.id, id))
		.limit(1);

type ArtSourceRow = Awaited<ReturnType<typeof selectArtSource>>[number];

const toArtSource = ({ palestranteNome, foto, horario, ...talk }: ArtSourceRow): TalkArtSource => ({
	...talk,
	horario: toClockTime(horario),
	palestrante: palestranteNome === null ? null : { nome: palestranteNome, foto: foto && new Uint8Array(foto) },
});

export const findArtSource = async (database: TalkReader, id: number): Promise<TalkArtSource | undefined> => {
	const [row] = await selectArtSource(database, id);
	return row && toArtSource(row);
};
