import { File } from 'node:buffer';

import { describe, expect, it } from 'vitest';

import { NOTICE_TEXT_MAX_LENGTH, avisoSchema } from '$lib/validation/aviso';
import { getFieldErrors } from './field-errors';

const REQUIRED_NOTICE_TEXT_MESSAGE = 'O texto do aviso é obrigatório.';
const INVALID_NOTICE_TEXT_MESSAGE = 'O texto do aviso deve ser textual.';
const MAXIMUM_NOTICE_TEXT_MESSAGE = 'O texto do aviso excede o limite de caracteres.';

describe('avisoSchema', () => {
	it.each([
		['single character', 'a'],
		['maximum length', 'a'.repeat(NOTICE_TEXT_MAX_LENGTH)],
		['surrounding whitespace', '  Aviso importante  '],
	])('accepts %s without changing the text', (_, texto) => {
		const result = avisoSchema.safeParse({ texto });

		expect(result).toMatchObject({ success: true, data: { texto } });
	});

	it.each([
		['missing text', undefined, REQUIRED_NOTICE_TEXT_MESSAGE],
		['null text', null, REQUIRED_NOTICE_TEXT_MESSAGE],
		['a non-textual file', new File(['notice'], 'notice.txt'), INVALID_NOTICE_TEXT_MESSAGE],
		['blank text', '   ', REQUIRED_NOTICE_TEXT_MESSAGE],
		['text exceeding the maximum length', 'a'.repeat(NOTICE_TEXT_MAX_LENGTH + 1), MAXIMUM_NOTICE_TEXT_MESSAGE],
	])('rejects %s', (_, texto, message) => {
		const result = avisoSchema.safeParse({ texto });

		expect(getFieldErrors(result)?.texto).toEqual([message]);
	});
});
