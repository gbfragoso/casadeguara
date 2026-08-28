import { describe, expect, it } from 'vitest';

import { cpf, rg } from '$lib/utils/mask';

describe('cpf', () => {
	it('masks a synthetic valid CPF with only the approved digits', () => {
		const result = cpf('01234567855');

		expect(result).toBe('012.***.***-55');
	});

	it('normalizes formatted values before masking', () => {
		const result = cpf('012.345.678-55');

		expect(result).toBe('012.***.***-55');
	});

	it.each([null, undefined, ''])('returns null for an absent value', (value) => {
		expect(cpf(value)).toBeNull();
	});
});

describe('rg', () => {
	it('masks a synthetic RG with only the approved digits', () => {
		const result = rg('123456789');

		expect(result).toBe('12.***.***-89');
	});

	it.each([null, undefined, ''])('returns null for an absent value', (value) => {
		expect(rg(value)).toBeNull();
	});
});
