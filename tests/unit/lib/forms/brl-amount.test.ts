import { describe, expect, it } from 'vitest';

import { createBrlAmountState, updateBrlAmountState } from '$lib/forms/brl-amount';

describe('brl amount transformations', () => {
	it('keeps the banking sequence while digits are appended', () => {
		const expected = [
			['0,01', '0.01'],
			['0,17', '0.17'],
			['1,70', '1.70'],
			['17,00', '17.00'],
			['170,05', '170.05'],
			['1.700,58', '1700.58'],
		];
		let state = createBrlAmountState('');

		expect(state).toMatchObject({ digits: '', displayValue: '0,00', canonicalValue: '' });
		expected.forEach(([displayValue, canonicalValue], index) => {
			state = updateBrlAmountState(state, `${state.displayValue}${'170058'[index]}`);
			expect(state).toMatchObject({ displayValue, canonicalValue });
		});
	});

	it('removes one significant digit for each backspace', () => {
		let state = createBrlAmountState('1700.58');
		const expected = [
			['170,05', '170.05'],
			['17,00', '17.00'],
			['1,70', '1.70'],
			['0,17', '0.17'],
			['0,01', '0.01'],
			['0,00', ''],
		];

		expected.forEach(([displayValue, canonicalValue]) => {
			state = updateBrlAmountState(state, state.displayValue.slice(0, -1));
			expect(state).toMatchObject({ displayValue, canonicalValue });
		});
	});

	it('distinguishes an empty field from an explicitly typed zero', () => {
		const empty = createBrlAmountState('');
		const zero = updateBrlAmountState(empty, `${empty.displayValue}0`);

		expect(zero).toMatchObject({ digits: '0', displayValue: '0,00', canonicalValue: '0.00' });
		expect(updateBrlAmountState(zero, '0,0')).toMatchObject({
			digits: '',
			displayValue: '0,00',
			canonicalValue: '',
		});
	});

	it('normalizes leading zeros without growing the logical state', () => {
		const oneCent = updateBrlAmountState(createBrlAmountState(''), '0001');
		const zero = updateBrlAmountState(createBrlAmountState(''), '0000');

		expect(oneCent).toMatchObject({ digits: '1', displayValue: '0,01', canonicalValue: '0.01' });
		expect(zero).toMatchObject({ digits: '0', displayValue: '0,00', canonicalValue: '0.00' });
	});

	it.each(['1700.58', '1700,58', 'R$ 1.700,58'])('normalizes pasted value %s', (pastedValue) => {
		const state = updateBrlAmountState(createBrlAmountState(''), pastedValue);

		expect(state).toMatchObject({ digits: '170058', displayValue: '1.700,58', canonicalValue: '1700.58' });
	});

	it('ignores symbols when they are added to an existing value', () => {
		const current = createBrlAmountState('12.34');

		expect(updateBrlAmountState(current, `${current.displayValue}abc`)).toBe(current);
		expect(updateBrlAmountState(createBrlAmountState(''), 'abc')).toMatchObject({
			digits: '',
			canonicalValue: '',
		});
	});

	it.each([
		['1700', '1700.00'],
		['123.2', '123.20'],
		['123.23', '123.23'],
	])('restores canonical initial value %s', (value, canonicalValue) => {
		const state = createBrlAmountState(value);

		expect(state.canonicalValue).toBe(canonicalValue);
	});

	it('keeps invalid initial values visible instead of rounding them', () => {
		const negative = createBrlAmountState('-1.00');
		const precise = createBrlAmountState('123.234');

		expect(negative).toEqual({ digits: '', displayValue: '-1.00', canonicalValue: '-1.00' });
		expect(precise).toEqual({ digits: '', displayValue: '123.234', canonicalValue: '123.234' });
	});

	it('preserves digits beyond the safe integer range', () => {
		const state = createBrlAmountState('900719925474099312345.67');

		expect(state.digits).toBe('90071992547409931234567');
		expect(state.canonicalValue).toBe('900719925474099312345.67');
		expect(state.displayValue).toBe('900.719.925.474.099.312.345,67');
	});

	it('groups thousands without changing the canonical decimal', () => {
		const state = createBrlAmountState('17508.90');

		expect(state.displayValue).toBe('17.508,90');
		expect(state.canonicalValue).toBe('17508.90');
	});
});
