import { describe, expect, it } from 'vitest';

import { DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import { formatTalkSchedule, formatTalkTime, suggestTalkTime } from '#lib/talks/schedule.js';
import type { WeekdayTimes } from '#lib/talks/types.js';

const SUGGESTIONS: WeekdayTimes = { 1: '08:45', 2: null, 3: null, 4: null, 5: null, 6: '14:30', 7: null };

describe('TU-08 formatTalkSchedule', () => {
	it('writes the weekday, the civil date and the time', () => {
		expect(formatTalkSchedule('2026-03-02', '08:45')).toBe('Segunda-feira, 02/03/2026 · 08:45');
	});
});

describe('TU-10 formatTalkTime', () => {
	it('writes the time as HHhMM', () => {
		expect(formatTalkTime('08:45')).toBe('08h45');
	});
});

describe('TU-09 suggestTalkTime', () => {
	it('suggests the time of the same ISO weekday', () => {
		expect(suggestTalkTime('2026-03-09', SUGGESTIONS)).toBe('08:45');
	});

	it('suggests nothing for a weekday without a reference talk', () => {
		expect(suggestTalkTime('2026-03-10', SUGGESTIONS)).toBeNull();
	});

	it('suggests nothing before a date is chosen', () => {
		expect(suggestTalkTime('', SUGGESTIONS)).toBeNull();
	});
});

describe('DEFAULT_TALK_LOCATION', () => {
	it('suggests the house address of CA-05', () => {
		expect(DEFAULT_TALK_LOCATION).toBe('Rua Major Dórea, 86, Castália, Itabuna-BA');
	});
});
