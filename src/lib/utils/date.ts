const CIVIL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const formatCivilDate = (value: string | null | undefined): string => {
	if (!value) return '';
	const match = CIVIL_DATE_PATTERN.exec(value);
	if (!match) return value;
	const [, year, month, day] = match;
	return `${day}/${month}/${year}`;
};

const monthYearFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const formatMonthYear = (reference: Date): string => monthYearFormatter.format(reference);

const BAHIA_TIME_ZONE = 'America/Bahia';
const bahiaIsoDateFormatter = new Intl.DateTimeFormat('en-CA', {
	timeZone: BAHIA_TIME_ZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
});

export const readBahiaIsoDate = (reference: Date): string => bahiaIsoDateFormatter.format(reference);

export const readBahiaCivilDate = (reference: Date): Date => new Date(`${readBahiaIsoDate(reference)}T00:00:00Z`);

export const addCivilDays = (civilDate: Date, days: number): Date => {
	const shifted = new Date(civilDate);
	shifted.setUTCDate(shifted.getUTCDate() + days);
	return shifted;
};

const ISO_WEEKDAYS_FROM_SUNDAY = [7, 1, 2, 3, 4, 5, 6] as const;

export type IsoWeekday = (typeof ISO_WEEKDAYS_FROM_SUNDAY)[number];

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'UTC' });

const toUtcMidnight = (civilDate: string) => new Date(`${civilDate}T00:00:00Z`);

export const readIsoWeekday = (civilDate: string): IsoWeekday =>
	ISO_WEEKDAYS_FROM_SUNDAY[toUtcMidnight(civilDate).getUTCDay()];

export const formatWeekday = (civilDate: string): string => {
	const weekday = weekdayFormatter.format(toUtcMidnight(civilDate));
	return `${weekday.charAt(0).toLocaleUpperCase('pt-BR')}${weekday.slice(1)}`;
};

export const formatCivilDateWithWeekday = (civilDate: string): string =>
	`${formatWeekday(civilDate)}, ${formatCivilDate(civilDate)}`;

const monthNameFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' });

export const formatMonthName = (civilDate: string): string => monthNameFormatter.format(toUtcMidnight(civilDate));

const WEEKDAY_ABBREVIATIONS: Record<IsoWeekday, string> = {
	1: 'SEG',
	2: 'TER',
	3: 'QUA',
	4: 'QUI',
	5: 'SEX',
	6: 'SÁB',
	7: 'DOM',
};

export const formatWeekdayAbbreviation = (civilDate: string): string =>
	WEEKDAY_ABBREVIATIONS[readIsoWeekday(civilDate)];
