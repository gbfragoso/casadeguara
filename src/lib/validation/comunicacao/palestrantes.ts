import { normalizeSearch } from '#lib/forms/autocomplete.js';
import { z } from 'zod';

export const SPEAKER_NAME_MAX_LENGTH = 60;

const REQUIRED_NAME_MESSAGE = 'Informe o nome do palestrante.';
const MAX_NAME_LENGTH_MESSAGE = `O nome do palestrante deve ter até ${SPEAKER_NAME_MAX_LENGTH} caracteres.`;
const INVALID_SEARCH_MESSAGE = 'Busca de palestrante inválida.';
const INVALID_CADASTRO_MESSAGE = 'Selecione um cadastro válido.';

export const speakerNameSchema = z
	.string({ error: REQUIRED_NAME_MESSAGE })
	.trim()
	.min(1, REQUIRED_NAME_MESSAGE)
	.max(SPEAKER_NAME_MAX_LENGTH, MAX_NAME_LENGTH_MESSAGE);

export const speakerSchema = z.object({ nome: speakerNameSchema });

export const speakerSearchSchema = z.object({
	nome: z
		.string({ error: INVALID_SEARCH_MESSAGE })
		.trim()
		.max(SPEAKER_NAME_MAX_LENGTH, MAX_NAME_LENGTH_MESSAGE)
		.nullish()
		.transform((nome) => normalizeSearch(nome ?? '')),
});

export const speakerImportSchema = z.object({
	cadastroId: z.coerce
		.number({ error: INVALID_CADASTRO_MESSAGE })
		.int(INVALID_CADASTRO_MESSAGE)
		.positive(INVALID_CADASTRO_MESSAGE),
});

export type SpeakerInput = z.infer<typeof speakerSchema>;
export type SpeakerSearchInput = z.infer<typeof speakerSearchSchema>;
