import { createCalendarMonth, type CalendarMonth } from '#lib/utils/calendar-month.js';

export type BirthdayMonthOption = { value: string; label: string; month: number };

const MONTH_LABELS = [
	'Janeiro',
	'Fevereiro',
	'Março',
	'Abril',
	'Maio',
	'Junho',
	'Julho',
	'Agosto',
	'Setembro',
	'Outubro',
	'Novembro',
	'Dezembro',
] as const;
const MONTH_VALUE_DIGITS = 2;
const ISO_YEAR_END = 4;
const ISO_MONTH_START = 5;
const ISO_MONTH_END = 7;

export const BIRTHDAY_MONTH_OPTIONS: readonly BirthdayMonthOption[] = MONTH_LABELS.map((label, index) => ({
	value: String(index + 1).padStart(MONTH_VALUE_DIGITS, '0'),
	label,
	month: index + 1,
}));

export const INVALID_BIRTHDAY_MONTH_MESSAGE = 'Escolha um mês de janeiro a dezembro.';

export const parseBirthdayMonth = (value: FormDataEntryValue | null): BirthdayMonthOption | undefined =>
	BIRTHDAY_MONTH_OPTIONS.find((option) => option.value === value);

export const readCurrentMonthValue = (today: string): string => today.slice(ISO_MONTH_START, ISO_MONTH_END);

export const resolveReferenceMonth = (month: number, today: string): CalendarMonth => {
	const currentYear = Number(today.slice(0, ISO_YEAR_END));
	const currentMonth = Number(readCurrentMonthValue(today));
	const year = month >= currentMonth ? currentYear : currentYear + 1;

	return createCalendarMonth(year, month);
};
