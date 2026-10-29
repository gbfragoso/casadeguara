import { describe, expect, it } from 'vitest';

import { DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import {
	formatRelativeTalkDay,
	formatTalkDateBadge,
	readDistinctTalkLocation,
	splitLastWord,
} from '#lib/talks/public/format.js';

const TODAY = '2026-12-31';

describe('formatRelativeTalkDay', () => {
	it('calls a talk on the current day "Hoje"', () => {
		expect(formatRelativeTalkDay(TODAY, TODAY)).toBe('Hoje');
	});

	it('calls a talk on the next day "Amanhã", across the turn of the year', () => {
		expect(formatRelativeTalkDay('2027-01-01', TODAY)).toBe('Amanhã');
	});

	it('names the weekday and the date of a later talk', () => {
		expect(formatRelativeTalkDay('2027-01-02', TODAY)).toBe('Sábado, 02/01/2027');
	});
});

describe('formatTalkDateBadge', () => {
	it('splits the date into weekday, day and month for the badge', () => {
		expect(formatTalkDateBadge('2027-01-02')).toEqual({ diaSemana: 'SÁB', dia: '02', mes: 'JANEIRO' });
	});
});

describe('readDistinctTalkLocation', () => {
	it('hides the location when the talk happens at the Casa', () => {
		expect(readDistinctTalkLocation(DEFAULT_TALK_LOCATION)).toBeNull();
	});

	it('hides the location when none is recorded', () => {
		expect(readDistinctTalkLocation(null)).toBeNull();
	});

	it('shows a location other than the Casa', () => {
		expect(readDistinctTalkLocation('Praça Olinto Leone')).toBe('Praça Olinto Leone');
	});
});

describe('splitLastWord', () => {
	it('separates the last word of a title so it can carry the underline', () => {
		expect(splitLastWord('O perdão que liberta')).toEqual({ lead: 'O perdão que ', lastWord: 'liberta' });
	});

	it('keeps a one-word title whole', () => {
		expect(splitLastWord(' Caridade ')).toEqual({ lead: '', lastWord: 'Caridade' });
	});
});
