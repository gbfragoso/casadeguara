export type MonthWindow = {
	keys: readonly string[];
	start: Date;
	endExclusive: Date;
};

const BAHIA_TIME_ZONE = 'America/Bahia';
const MONTH_COUNT = 12;
const bahiaMonthFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: BAHIA_TIME_ZONE,
	year: 'numeric',
	month: '2-digit',
});

const readBahiaMonth = (reference: Date): { year: number; month: number } => {
	if (Number.isNaN(reference.getTime())) throw new RangeError('Reference date must be valid.');

	const parts = bahiaMonthFormatter.formatToParts(reference);
	const yearPart = parts.find((part) => part.type === 'year')?.value;
	const monthPart = parts.find((part) => part.type === 'month')?.value;
	if (!yearPart || !monthPart) throw new RangeError('Reference date has no civil month.');

	return { year: Number(yearPart), month: Number(monthPart) - 1 };
};

const createMonthKey = (year: number, month: number): string => {
	const date = new Date(Date.UTC(year, month, 1));
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

export const getBahiaMonthWindow = (reference: Date): MonthWindow => {
	const { year, month } = readBahiaMonth(reference);
	const start = new Date(Date.UTC(year, month - (MONTH_COUNT - 1), 1));
	const keys = Array.from({ length: MONTH_COUNT }, (_, index) =>
		createMonthKey(start.getUTCFullYear(), start.getUTCMonth() + index),
	);
	const endExclusive = new Date(Date.UTC(year, month + 1, 1));

	return { keys, start, endExclusive };
};
