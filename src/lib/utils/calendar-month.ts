import { formatMonthYear } from '#lib/utils/date.js';

export type CalendarMonth = { key: string; year: number; month: number };

const MONTHS_PER_YEAR = 12;
const MONTH_KEY_DIGITS = 2;

export const createCalendarMonth = (year: number, month: number): CalendarMonth => ({
	key: `${year}-${String(month).padStart(MONTH_KEY_DIGITS, '0')}`,
	year,
	month,
});

export const followCalendarMonth = ({ year, month }: CalendarMonth): CalendarMonth =>
	month === MONTHS_PER_YEAR ? createCalendarMonth(year + 1, 1) : createCalendarMonth(year, month + 1);

export const formatCalendarMonth = ({ year, month }: CalendarMonth): string =>
	formatMonthYear(new Date(Date.UTC(year, month - 1)));
