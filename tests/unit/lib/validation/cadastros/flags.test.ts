import { File } from 'node:buffer';
import { describe, expect, it } from 'vitest';

import { secretariaFlagsSchema } from '$lib/validation/cadastros/flags';
import { getFieldErrors } from '../field-errors';

const INVALID = 'Cadastro ou campo de atualização inválido.';

describe('secretariaFlagsSchema', () => {
	it.each([true, false])('accepts the exact %s flag boolean', (value) => {
		const result = secretariaFlagsSchema.safeParse({ id: 42, field: 'frequencia', value });

		expect(result).toMatchObject({ success: true, data: { id: 42, field: 'frequencia', value } });
	});

	it.each([
		['missing id', { field: 'trab', value: true }, 'id'],
		['file id', { id: new File(['id'], 'id.txt'), field: 'trab', value: true }, 'id'],
		['zero id', { id: 0, field: 'trab', value: true }, 'id'],
		['string id', { id: '1', field: 'trab', value: true }, 'id'],
		['arbitrary field', { id: 1, field: 'status', value: true }, 'field'],
		['invalid boolean', { id: 1, field: 'trab', value: 'on' }, 'value'],
	])('rejects %s', (_, input, field) => {
		const result = secretariaFlagsSchema.safeParse(input);

		expect(getFieldErrors(result)).toMatchObject({ [field]: [INVALID] });
	});

	it('rejects multiple simultaneous flags and oversized ids', () => {
		const multiple = secretariaFlagsSchema.safeParse({ id: 1, field: 'trab', value: true, frequencia: true });
		const oversized = secretariaFlagsSchema.safeParse({ id: 32_768, field: 'trab', value: true });

		expect(multiple.success).toBe(false);
		expect(getFieldErrors(oversized)?.id).toEqual([INVALID]);
	});
});
