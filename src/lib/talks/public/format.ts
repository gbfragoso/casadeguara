import { formatArtDateSeal } from '#lib/talks/art/format.js';
import { DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import { addCivilDays, formatCivilDateWithWeekday, formatWeekdayAbbreviation } from '#lib/utils/date.js';

const ISO_DATE_LENGTH = 10;
const UNTITLED_TALK_HEADING = 'Palestra pública';

const readNextCivilDay = (civilDate: string) =>
	addCivilDays(new Date(`${civilDate}T00:00:00Z`), 1)
		.toISOString()
		.slice(0, ISO_DATE_LENGTH);

export const readNearTalkDay = (data: string, today: string): 'Hoje' | 'Amanhã' | null => {
	if (data === today) return 'Hoje';
	if (data === readNextCivilDay(today)) return 'Amanhã';
	return null;
};

export const formatRelativeTalkDay = (data: string, today: string): string =>
	readNearTalkDay(data, today) ?? formatCivilDateWithWeekday(data);

export const readTalkHeading = (titulo: string | null): string => titulo?.trim() || UNTITLED_TALK_HEADING;

export const splitLastWord = (text: string) => {
	const trimmed = text.trim();
	const lastSpace = trimmed.lastIndexOf(' ');
	return { lead: trimmed.slice(0, lastSpace + 1), lastWord: trimmed.slice(lastSpace + 1) };
};

export const readDistinctTalkLocation = (local: string | null): string | null =>
	local === null || local === DEFAULT_TALK_LOCATION ? null : local;

export const formatTalkDateBadge = (data: string) => ({
	diaSemana: formatWeekdayAbbreviation(data),
	...formatArtDateSeal(data),
});
