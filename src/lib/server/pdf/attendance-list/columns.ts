import { addCivilDays, formatWeekdayAbbreviation, toUtcMidnight } from '#lib/utils/date.js';
import { formatDateColumn } from './content';

export type AttendanceColumn = { day: string; weekday: string; startsWeek: boolean };

const readWeekSunday = (date: string) => {
	const civilDate = toUtcMidnight(date);
	return addCivilDays(civilDate, -civilDate.getUTCDay()).getTime();
};

export const describeAttendanceColumns = (dates: string[]): AttendanceColumn[] => {
	const weekSundays = dates.map(readWeekSunday);
	return dates.map((date, index) => ({
		day: formatDateColumn(date),
		weekday: formatWeekdayAbbreviation(date),
		startsWeek: index > 0 && weekSundays[index] !== weekSundays[index - 1],
	}));
};
