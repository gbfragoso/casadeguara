import type { Page } from '@playwright/test';

import { ATTENDANCE_READY_LABEL } from '../../src/lib/attendance/format';
import type { E2EData } from './fixtures-types';
import { openModulePage } from './support/module-shell';

const ATTENDANCE_PATH = '/secretaria/frequencia';

export type AttendanceRequest = { title: string; start: string; end: string };

export const titleInput = (page: Page) => page.getByLabel('Título da lista', { exact: true });

export const startDateInput = (page: Page) => page.getByLabel('Data inicial', { exact: true });

export const endDateInput = (page: Page) => page.getByLabel('Data final', { exact: true });

export const weekdaysGroup = (page: Page) => page.getByRole('group', { name: 'Dias da semana' });

export const generatePdfButton = (page: Page) => page.getByRole('button', { name: 'Gerar PDF' });

export const openPdfLink = (page: Page) => page.getByRole('link', { name: 'Abrir para imprimir' });

export const pdfStatus = (page: Page) => page.getByRole('status');

export const readyStatus = (page: Page) => pdfStatus(page).filter({ hasText: ATTENDANCE_READY_LABEL });

export const openAttendancePage = (page: Page, e2e: E2EData) => openModulePage(page, e2e, ATTENDANCE_PATH);

export const fillAttendanceRequest = async (page: Page, { title, start, end }: AttendanceRequest) => {
	await titleInput(page).fill(title);
	await startDateInput(page).fill(start);
	await endDateInput(page).fill(end);
};

export const seedAttendanceWorkers = async (e2e: E2EData, count: number) => {
	const workers = await Promise.all(
		Array.from({ length: count }, (_, index) => e2e.createParticipant(`frequencia-${index + 1}`)),
	);
	const ids = workers.map((worker) => worker.id);
	await e2e.database`update cadastros set frequencia = true where idleitor = any(${ids})`;
};
