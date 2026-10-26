import { describe, expect, it } from 'vitest';

import {
	TALK_NOTES_MAX_LENGTH,
	TALK_TITLE_MAX_LENGTH,
	talkCreateSchema,
} from '#lib/validation/comunicacao/palestras.js';
import { getFieldErrors } from '../field-errors';

const VALID_CREATION = { data: '2026-03-09', horario: '08:45', local: '', reuniaoCom: '' };

describe('talkCreateSchema content and speaker', () => {
	it('accepts a title, notes and an existing speaker', () => {
		const result = talkCreateSchema.parse({
			...VALID_CREATION,
			titulo: ' A prece ',
			observacoes: 'Cap. 20',
			palestranteId: '4',
		});

		expect(result).toMatchObject({ titulo: 'A prece', observacoes: 'Cap. 20', palestranteId: 4 });
	});

	it.each([
		['absent', undefined],
		['empty', ''],
	])('treats %s optional fields as null', (_, value) => {
		const fields = { titulo: value, observacoes: value, palestranteId: value, novoPalestrante: value };

		const result = talkCreateSchema.parse({ ...VALID_CREATION, ...fields });

		expect(result).toMatchObject({ titulo: null, observacoes: null, palestranteId: null, novoPalestrante: null });
	});

	it('accepts and trims a new speaker name', () => {
		const result = talkCreateSchema.parse({ ...VALID_CREATION, novoPalestrante: ' Novo Nome ' });

		expect(result.novoPalestrante).toBe('Novo Nome');
	});

	it('rejects a title above the limit on the title field', () => {
		const result = talkCreateSchema.safeParse({ ...VALID_CREATION, titulo: 'a'.repeat(TALK_TITLE_MAX_LENGTH + 1) });

		expect(getFieldErrors(result)).toEqual({ titulo: ['O título deve ter até 70 caracteres.'] });
	});

	it('rejects notes above the limit on the notes field', () => {
		const result = talkCreateSchema.safeParse({
			...VALID_CREATION,
			observacoes: 'o'.repeat(TALK_NOTES_MAX_LENGTH + 1),
		});

		expect(getFieldErrors(result)).toEqual({ observacoes: ['As observações devem ter até 80 caracteres.'] });
	});

	it('rejects an invalid speaker id', () => {
		const result = talkCreateSchema.safeParse({ ...VALID_CREATION, palestranteId: 'abc' });

		expect(getFieldErrors(result)).toEqual({ palestranteId: ['Palestrante inválido.'] });
	});
});
