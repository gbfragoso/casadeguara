import { formatMonthYear } from '#lib/utils/date.js';

export type ProgramMonth = { key: string; year: number; month: number };

const MONTHS_PER_YEAR = 12;
const MONTH_KEY_DIGITS = 2;

const createProgramMonth = (year: number, month: number): ProgramMonth => ({
	key: `${year}-${String(month).padStart(MONTH_KEY_DIGITS, '0')}`,
	year,
	month,
});

const followProgramMonth = ({ year, month }: ProgramMonth): ProgramMonth =>
	month === MONTHS_PER_YEAR ? createProgramMonth(year + 1, 1) : createProgramMonth(year, month + 1);

export const listProgramMonths = (today: string): [ProgramMonth, ProgramMonth] => {
	const [year, month] = today.split('-').map(Number);
	const currentMonth = createProgramMonth(year, month);
	return [currentMonth, followProgramMonth(currentMonth)];
};

export const findProgramMonth = (key: string | null, today: string): ProgramMonth | undefined =>
	listProgramMonths(today).find((month) => month.key === key);

export const readMonthRange = (month: ProgramMonth): { firstDay: string; nextMonthFirstDay: string } => ({
	firstDay: `${month.key}-01`,
	nextMonthFirstDay: `${followProgramMonth(month).key}-01`,
});

export const formatProgramMonth = ({ year, month }: ProgramMonth): string =>
	formatMonthYear(new Date(Date.UTC(year, month - 1)));

export const formatProgramMonthOption = (month: ProgramMonth): string => {
	const label = formatProgramMonth(month);
	return `${label.charAt(0).toLocaleUpperCase('pt-BR')}${label.slice(1)}`;
};
