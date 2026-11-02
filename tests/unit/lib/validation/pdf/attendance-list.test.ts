import { describe, expect, it } from 'vitest';

import { parseAttendanceListRequest } from '#lib/validation/pdf/attendance-list.js';

const TITLE_MESSAGE = 'Informe o título da lista (até 60 caracteres).';
const PERIOD_MESSAGE = 'Informe um período válido.';
const NO_DATES_MESSAGE = 'Nenhuma data do período corresponde aos dias selecionados.';
const MAX_TITLE_LENGTH = 60;

type RequestOverrides = {
	titulo?: string | undefined;
	dataInicio?: string | undefined;
	dataFim?: string | undefined;
	dias?: string[];
};

const VALID_FIELDS = {
	titulo: 'Lista de presença',
	dataInicio: '2026-11-01',
	dataFim: '2026-11-30',
	dias: ['1', '2', '4'],
};

const buildParams = (overrides: RequestOverrides = {}) => {
	const { dias, ...fields } = { ...VALID_FIELDS, ...overrides };
	const params = new URLSearchParams();
	Object.entries(fields).forEach(([key, value]) => {
		if (value !== undefined) params.set(key, value);
	});
	dias.forEach((day) => params.append('dias', day));
	return params;
};

const readIssues = (params: URLSearchParams) => {
	const result = parseAttendanceListRequest(params);
	return result.success ? [] : result.issues;
};

describe('TU-03 title', () => {
	it.each([
		['a blank title', '   '],
		['a title of 61 characters', 'a'.repeat(MAX_TITLE_LENGTH + 1)],
		['a title with a control character', 'Lista\u0007'],
	])('rejects %s', (_, titulo) => {
		const params = buildParams({ titulo });

		const issues = readIssues(params);

		expect(issues).toEqual([{ field: 'titulo', message: TITLE_MESSAGE }]);
	});

	it('rejects a missing title', () => {
		const params = buildParams({ titulo: undefined });

		const issues = readIssues(params);

		expect(issues).toEqual([{ field: 'titulo', message: TITLE_MESSAGE }]);
	});
});

describe('TU-04 title', () => {
	it('keeps a 60-character title with accents and punctuation unchanged', () => {
		const title = 'Escala de quarta — Turma B (2º semestre): ação & atenção'.padEnd(MAX_TITLE_LENGTH, '!');
		const params = buildParams({ titulo: `  ${title}  ` });

		const result = parseAttendanceListRequest(params);

		expect(result).toMatchObject({ success: true, data: { title } });
	});
});

describe('TU-05 period', () => {
	it.each([
		['a missing start date', { dataInicio: undefined }],
		['an impossible end date', { dataFim: '2026-02-30' }],
		['an end before the start', { dataInicio: '2026-11-30', dataFim: '2026-11-01' }],
	])('rejects %s', (_, overrides) => {
		const params = buildParams(overrides);

		const issues = readIssues(params);

		expect(issues).toEqual([{ field: 'periodo', message: PERIOD_MESSAGE }]);
	});

	it('reports the title and the period together without judging the weekdays', () => {
		const params = buildParams({ titulo: '', dataFim: '2026-10-01', dias: [] });

		const issues = readIssues(params);

		expect(issues).toEqual([
			{ field: 'titulo', message: TITLE_MESSAGE },
			{ field: 'periodo', message: PERIOD_MESSAGE },
		]);
	});
});

describe('TU-06 weekdays', () => {
	it.each([
		['a request without weekdays', { dias: [] }],
		['a weekday outside 0 to 6', { dias: ['7'] }],
		['a period without matching dates', { dataInicio: '2026-11-01', dataFim: '2026-11-01', dias: ['1'] }],
	])('rejects %s', (_, overrides) => {
		const params = buildParams(overrides);

		const issues = readIssues(params);

		expect(issues).toEqual([{ field: 'dias', message: NO_DATES_MESSAGE }]);
	});
});

describe('TU-07 date limit', () => {
	it('rejects 16 dates with the computed count in the message', () => {
		const params = buildParams({ dataFim: '2026-12-07' });

		const issues = readIssues(params);

		expect(issues).toEqual([
			{
				field: 'dias',
				message: 'O período gera 16 datas; o limite é 15 por lista. Reduza o período ou os dias da semana.',
			},
		]);
	});

	it('accepts 15 dates in chronological order', () => {
		const params = buildParams({ dataFim: '2026-12-03' });

		const result = parseAttendanceListRequest(params);

		expect(result).toEqual({
			success: true,
			data: {
				title: 'Lista de presença',
				period: { start: '2026-11-01', end: '2026-12-03' },
				dates: [
					'2026-11-02',
					'2026-11-03',
					'2026-11-05',
					'2026-11-09',
					'2026-11-10',
					'2026-11-12',
					'2026-11-16',
					'2026-11-17',
					'2026-11-19',
					'2026-11-23',
					'2026-11-24',
					'2026-11-26',
					'2026-11-30',
					'2026-12-01',
					'2026-12-03',
				],
			},
		});
	});
});
