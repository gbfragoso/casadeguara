export type SeedCalendar = {
	today: string;
	monthStart: string;
	monthEnd: string;
	dueDate: string;
	previousMonthStart: string;
	twoMonthsAgoStart: string;
};

const LOAN_TERM_DAYS = 14;

const padDatePart = (value: number) => String(value).padStart(2, '0');

export const toCivilDate = (date: Date) =>
	`${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;

const shiftDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const monthStartFrom = (date: Date, monthOffset: number) =>
	new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);

export const createSeedCalendar = (now: Date): SeedCalendar => ({
	today: toCivilDate(now),
	monthStart: toCivilDate(monthStartFrom(now, 0)),
	monthEnd: toCivilDate(shiftDays(monthStartFrom(now, 1), -1)),
	dueDate: toCivilDate(shiftDays(now, LOAN_TERM_DAYS)),
	previousMonthStart: toCivilDate(monthStartFrom(now, -1)),
	twoMonthsAgoStart: toCivilDate(monthStartFrom(now, -2)),
});
