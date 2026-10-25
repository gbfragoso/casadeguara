import { z } from 'zod';

import { speakerNameSchema } from './palestrantes';

export const TALK_TITLE_MAX_LENGTH = 120;
export const TALK_NOTES_MAX_LENGTH = 500;
export const TALK_LOCATION_MAX_LENGTH = 120;
export const MOVE_RANGE_MIN = 2;
export const MOVE_RANGE_MAX = 200;

const REQUIRED_DATE_MESSAGE = 'Informe a data.';
const INVALID_DATE_MESSAGE = 'Informe uma data válida.';
const REQUIRED_TIME_MESSAGE = 'Informe o horário.';
const INVALID_TIME_MESSAGE = 'Informe um horário válido no formato HH:MM.';
const INVALID_TEXT_MESSAGE = 'Informe um texto válido.';
const INVALID_IDENTIFIER_MESSAGE = 'Identificador inválido.';
const INVALID_SPEAKER_MESSAGE = 'Palestrante inválido.';
const INVALID_MOVE_MESSAGE = 'Troca de datas inválida.';

const isMissing = (input: unknown) => input === undefined || input === null || input === '';

const civilDateSchema = z.iso.date({
	error: (issue) => (isMissing(issue.input) ? REQUIRED_DATE_MESSAGE : INVALID_DATE_MESSAGE),
});

const clockTimeSchema = z.iso.time({
	precision: -1,
	error: (issue) => (isMissing(issue.input) ? REQUIRED_TIME_MESSAGE : INVALID_TIME_MESSAGE),
});

const optionalTextSchema = (maxLength: number, maxLengthMessage: string) =>
	z
		.string({ error: INVALID_TEXT_MESSAGE })
		.trim()
		.max(maxLength, maxLengthMessage)
		.nullish()
		.transform((text) => text || null);

const titleSchema = optionalTextSchema(
	TALK_TITLE_MAX_LENGTH,
	`O título deve ter até ${TALK_TITLE_MAX_LENGTH} caracteres.`,
);
const notesSchema = optionalTextSchema(
	TALK_NOTES_MAX_LENGTH,
	`As observações devem ter até ${TALK_NOTES_MAX_LENGTH} caracteres.`,
);
const locationSchema = optionalTextSchema(
	TALK_LOCATION_MAX_LENGTH,
	`O local deve ter até ${TALK_LOCATION_MAX_LENGTH} caracteres.`,
);

const identifierSchema = z.coerce
	.number({ error: INVALID_IDENTIFIER_MESSAGE })
	.int(INVALID_IDENTIFIER_MESSAGE)
	.positive(INVALID_IDENTIFIER_MESSAGE);

const speakerIdSchema = z.preprocess(
	(value) => (value === '' ? null : value),
	z.coerce
		.number({ error: INVALID_SPEAKER_MESSAGE })
		.int(INVALID_SPEAKER_MESSAGE)
		.positive(INVALID_SPEAKER_MESSAGE)
		.nullable(),
);

export const talkCreateSchema = z.object({ data: civilDateSchema, horario: clockTimeSchema, local: locationSchema });

export const talkTargetSchema = z.object({ id: identifierSchema, versao: identifierSchema });

export const talkChangeSchema = z.discriminatedUnion('campo', [
	z.object({ campo: z.literal('titulo'), valor: titleSchema }),
	z.object({ campo: z.literal('observacoes'), valor: notesSchema }),
	z.object({ campo: z.literal('local'), valor: locationSchema }),
	z.object({ campo: z.literal('palestranteId'), valor: speakerIdSchema }),
	z.object({ campo: z.literal('novoPalestrante'), valor: speakerNameSchema }),
	z.object({ campo: z.literal('data'), valor: civilDateSchema }),
	z.object({ campo: z.literal('horario'), valor: clockTimeSchema }),
]);

export const talkDeleteSchema = z.object({ id: identifierSchema });

const hasDistinctItems = (items: readonly number[]) => new Set(items).size === items.length;

const connectsRangeEnds = ({ origemId, destinoId, ids }: { origemId: number; destinoId: number; ids: number[] }) => {
	const ends = [ids[0], ids.at(-1)];
	return origemId !== destinoId && ends.includes(origemId) && ends.includes(destinoId);
};

export const talkMoveSchema = z
	.object({
		origemId: identifierSchema,
		destinoId: identifierSchema,
		ids: z
			.array(identifierSchema)
			.min(MOVE_RANGE_MIN, INVALID_MOVE_MESSAGE)
			.max(MOVE_RANGE_MAX, INVALID_MOVE_MESSAGE),
		versoes: z.array(identifierSchema),
	})
	.refine(({ ids, versoes }) => ids.length === versoes.length, { message: INVALID_MOVE_MESSAGE, path: ['versoes'] })
	.refine(({ ids }) => hasDistinctItems(ids), { message: INVALID_MOVE_MESSAGE, path: ['ids'] })
	.refine(connectsRangeEnds, { message: INVALID_MOVE_MESSAGE, path: ['destinoId'] })
	.transform(({ origemId, destinoId, ids, versoes }) => ({
		originId: origemId,
		targetId: destinoId,
		range: ids.map((id, index) => ({ id, versao: versoes[index] })),
	}));

export type TalkCreateData = z.infer<typeof talkCreateSchema>;
export type TalkTarget = z.infer<typeof talkTargetSchema>;
export type TalkChange = z.infer<typeof talkChangeSchema>;
export type TalkMoveRequest = z.infer<typeof talkMoveSchema>;
