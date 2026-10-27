import { formatCivilDateWithWeekday, readIsoWeekday } from '#lib/utils/date.js';

import type { WeekdayTimes } from './types';

export const formatTalkSchedule = (data: string, horario: string): string =>
	`${formatCivilDateWithWeekday(data)} · ${horario}`;

export const suggestTalkTime = (data: string, suggestions: WeekdayTimes): string | null =>
	suggestions[readIsoWeekday(data)] ?? null;

export const readTalkClock = (horario: string): { hours: string; minutes: string } => {
	const [hours, minutes] = horario.split(':');
	return { hours, minutes };
};

export const formatTalkTime = (horario: string): string => {
	const { hours, minutes } = readTalkClock(horario);
	return `${hours}h${minutes}`;
};
