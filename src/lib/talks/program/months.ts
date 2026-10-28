import {
	type CalendarMonth,
	createCalendarMonth,
	followCalendarMonth,
	formatCalendarMonth,
} from '#lib/utils/calendar-month.js';

export type ProgramMonth = CalendarMonth;

export const listProgramMonths = (today: string): [ProgramMonth, ProgramMonth] => {
	const [year, month] = today.split('-').map(Number);
	const currentMonth = createCalendarMonth(year, month);
	return [currentMonth, followCalendarMonth(currentMonth)];
};

export const findProgramMonth = (key: string | null, today: string): ProgramMonth | undefined =>
	listProgramMonths(today).find((month) => month.key === key);

export const readMonthRange = (month: ProgramMonth): { firstDay: string; nextMonthFirstDay: string } => ({
	firstDay: `${month.key}-01`,
	nextMonthFirstDay: `${followCalendarMonth(month).key}-01`,
});

export const formatProgramMonthOption = (month: ProgramMonth): string => {
	const label = formatCalendarMonth(month);
	return `${label.charAt(0).toLocaleUpperCase('pt-BR')}${label.slice(1)}`;
};
