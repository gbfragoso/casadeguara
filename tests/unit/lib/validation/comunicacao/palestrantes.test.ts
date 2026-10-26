import { describe, expect, it } from 'vitest';

import {
	SPEAKER_NAME_MAX_LENGTH,
	speakerSchema,
	speakerSearchSchema,
} from '#lib/validation/comunicacao/palestrantes.js';
import { getFieldErrors } from '../field-errors';

describe('speakerSchema', () => {
	it('trims the speaker name', () => {
		expect(speakerSchema.parse({ nome: '  Carmélia Amorim ' })).toEqual({ nome: 'Carmélia Amorim' });
	});

	it('accepts 60 characters after trimming', () => {
		const nome = 'a'.repeat(SPEAKER_NAME_MAX_LENGTH);

		expect(speakerSchema.parse({ nome: `  ${nome}  ` })).toEqual({ nome });
	});

	it.each([
		['a missing name', undefined, 'Informe o nome do palestrante.'],
		['a blank name', '   ', 'Informe o nome do palestrante.'],
		[
			'a name with 61 characters',
			'a'.repeat(SPEAKER_NAME_MAX_LENGTH + 1),
			'O nome do palestrante deve ter até 60 caracteres.',
		],
	])('rejects %s', (_, nome, message) => {
		expect(getFieldErrors(speakerSchema.safeParse({ nome }))).toEqual({ nome: [message] });
	});
});

describe('speakerSearchSchema', () => {
	it('normalises the search term without accents, case or extra spaces', () => {
		expect(speakerSearchSchema.parse({ nome: '  CARMÉLIA   Amorim ' })).toEqual({ nome: 'carmelia amorim' });
	});

	it.each([undefined, null])('searches every speaker when the term is %s', (nome) => {
		expect(speakerSearchSchema.parse({ nome })).toEqual({ nome: '' });
	});

	it('rejects a term longer than a speaker name', () => {
		const result = speakerSearchSchema.safeParse({ nome: 'a'.repeat(SPEAKER_NAME_MAX_LENGTH + 1) });

		expect(getFieldErrors(result)).toEqual({ nome: ['O nome do palestrante deve ter até 60 caracteres.'] });
	});
});
