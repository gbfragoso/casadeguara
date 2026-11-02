import { addCivilDays, toUtcMidnight } from '#lib/utils/date.js';

export const MAX_ATTENDANCE_DATES = 15;

export const ATTENDANCE_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

export type AttendanceWeekday = (typeof ATTENDANCE_WEEKDAYS)[number];

export type AttendancePeriod = { start: string; end: string };

const DAYS_PER_WEEK = ATTENDANCE_WEEKDAYS.length;
const MILLISECONDS_PER_DAY = 86_400_000;
const ISO_DATE_LENGTH = 10;

const countPeriodDays = ({ start, end }: AttendancePeriod) =>
	(toUtcMidnight(end).getTime() - toUtcMidnight(start).getTime()) / MILLISECONDS_PER_DAY + 1;

const readFirstOffset = (start: string, weekday: AttendanceWeekday) =>
	(weekday - toUtcMidnight(start).getUTCDay() + DAYS_PER_WEEK) % DAYS_PER_WEEK;

const countWeekdayDates = (period: AttendancePeriod, weekday: AttendanceWeekday) => {
	const remainingDays = countPeriodDays(period) - readFirstOffset(period.start, weekday);
	return remainingDays > 0 ? Math.ceil(remainingDays / DAYS_PER_WEEK) : 0;
};

const listWeekdayDates = (period: AttendancePeriod, weekday: AttendanceWeekday) => {
	const firstDate = addCivilDays(toUtcMidnight(period.start), readFirstOffset(period.start, weekday));
	return Array.from({ length: countWeekdayDates(period, weekday) }, (_, week) =>
		addCivilDays(firstDate, week * DAYS_PER_WEEK)
			.toISOString()
			.slice(0, ISO_DATE_LENGTH),
	);
};

const readUniqueWeekdays = (weekdays: AttendanceWeekday[]) => [...new Set(weekdays)];

export const countAttendanceDates = (period: AttendancePeriod, weekdays: AttendanceWeekday[]): number =>
	readUniqueWeekdays(weekdays).reduce<number>((total, weekday) => total + countWeekdayDates(period, weekday), 0);

export const listAttendanceDates = (period: AttendancePeriod, weekdays: AttendanceWeekday[]): string[] =>
	readUniqueWeekdays(weekdays)
		.flatMap((weekday) => listWeekdayDates(period, weekday))
		.sort();
