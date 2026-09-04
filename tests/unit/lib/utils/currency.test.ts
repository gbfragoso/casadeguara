import { describe, expect, it } from 'vitest';

import { formatBrlDecimal, formatMonthLabel, moeda } from '$lib/utils/currency';

describe('moeda', () => {
	it('formats amounts as Brazilian reais', () => {
		const result = moeda(1234.5);

		expect(result).toContain('1.234,50');
		expect(result).toMatch(/R\$\s?1\.234,50/);
	});
});

describe('formatBrlDecimal', () => {
	it('adds the minimum cents without converting through a binary number', () => {
		expect(formatBrlDecimal('1234')).toBe('R$ 1.234,00');
		expect(formatBrlDecimal('1234.5')).toBe('R$ 1.234,50');
	});

	it('preserves significant fractional digits', () => {
		expect(formatBrlDecimal('1234.567890123456789')).toBe('R$ 1.234,567890123456789');
		expect(formatBrlDecimal('0.000001')).toBe('R$ 0,000001');
	});

	it('formats negative decimal strings without changing their precision', () => {
		expect(formatBrlDecimal('-12.345')).toBe('-R$ 12,345');
	});

	it('rejects values outside the decimal contract', () => {
		expect(() => formatBrlDecimal('1,25')).toThrow(RangeError);
		expect(() => formatBrlDecimal('12e2')).toThrow(RangeError);
	});
});

describe('formatMonthLabel', () => {
	it('converts a canonical month key to the Brazilian label', () => {
		expect(formatMonthLabel('2026-09')).toBe('09/2026');
	});

	it('rejects non-canonical month keys', () => {
		expect(() => formatMonthLabel('2026-13')).toThrow(RangeError);
		expect(() => formatMonthLabel('09/2026')).toThrow(RangeError);
	});
});
