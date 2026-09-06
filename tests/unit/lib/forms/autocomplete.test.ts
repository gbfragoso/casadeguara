import { describe, expect, it } from 'vitest';
import { filterOptions, indexOptions } from '$lib/forms/autocomplete';

const options = [
	{ value: '1', label: 'Clício Fogaça' },
	{ value: '2', label: 'Clébio Medeiros Fragoso' },
	{ value: '3', label: 'Clício Fogaça' },
];

describe('autocomplete search', () => {
	it.each([
		'Clício Fogaça',
		'clicio fogaca',
		'CLICIO FOGACA',
		'clicio fogaça',
		'Cli\u0301cio Fogac\u0327a',
		'  clicio   fogaca  ',
		'FOGA',
	])('finds both cadastros for %s without changing their labels', (query) => {
		const indexed = indexOptions(options);

		const matches = filterOptions(indexed, query);

		expect(matches.map(({ value, label }) => ({ value, label }))).toEqual([options[0], options[2]]);
	});

	it.each(['clébio medeiros fragoso', 'CLEBIO MEDEIROS', 'medeiros fragoso'])('finds Clébio for %s', (query) => {
		const indexed = indexOptions(options);

		const matches = filterOptions(indexed, query);

		expect(matches.map((option) => option.value)).toEqual(['2']);
	});

	it.each(['', '   '])('keeps every option in its original order for an empty query', (query) => {
		const indexed = indexOptions(options);

		const matches = filterOptions(indexed, query);

		expect(matches.map((option) => option.value)).toEqual(['1', '2', '3']);
	});

	it('returns no options for an unknown name', () => {
		const indexed = indexOptions(options);

		const matches = filterOptions(indexed, 'José');

		expect(matches).toEqual([]);
	});

	it('accepts an empty cadastro list', () => {
		const indexed = indexOptions([]);

		const matches = filterOptions(indexed, 'Clício');

		expect(matches).toEqual([]);
	});
});
