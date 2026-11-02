import type { AttendanceListDocument } from '#lib/server/pdf/attendance-list/content.js';

export const LONGEST_REGISTERED_NAME = 'PAULA APARECIDA SORIANO DE SOUZA JESUÍNO RODRIGUES';

export const NOVEMBER_MONDAYS_TUESDAYS_THURSDAYS = [2, 3, 5, 9, 10, 12, 16, 17, 19, 23, 24, 26, 30].map(
	(day) => `2026-11-${String(day).padStart(2, '0')}`,
);

export const FIFTEEN_DATES = Array.from({ length: 15 }, (_, index) => `2026-11-${String(index + 1).padStart(2, '0')}`);

const FIRST_NAMES = ['Ádria', 'Adriana', 'Benedito', 'Cláudia', 'Edvaldo', 'Josefa', 'Maria das Graças'];
const SURNAMES = ['Souza', 'Lima', 'Oliveira', 'dos Santos', 'Conceição', 'Nascimento', 'Ferreira Bittencourt'];

export const createWorkers = (count: number) =>
	Array.from(
		{ length: count },
		(_, index) =>
			`${FIRST_NAMES[index % FIRST_NAMES.length]} ${SURNAMES[index % SURNAMES.length]} ${SURNAMES[(index + 3) % SURNAMES.length]}`,
	);

export const createAttendanceDocument = (
	workers: string[],
	dates = NOVEMBER_MONDAYS_TUESDAYS_THURSDAYS,
): AttendanceListDocument => ({
	title: 'Lista de presença — Trabalhadores',
	dates,
	generatedOn: '2026-11-02',
	workers,
});
