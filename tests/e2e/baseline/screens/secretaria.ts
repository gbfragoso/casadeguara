import { expect, type Page } from '@playwright/test';

import { holdFrequenciaLock } from '../seed/frequencia-lock';
import { BIRTHDAY_MONTH } from '../seed/people';
import type { RepresentativeScreen } from '../types';

const INDICATOR_COUNT = 2;
const BIRTHDAY_PERSON = 'ANA BEATRIZ FICTÍCIA';

const openWhileAttendanceIsLocked = async (page: Page, path: string) => {
	await page.goto(path, { waitUntil: 'commit' });
	await expect(page.getByText('Trabalhadores')).toBeVisible();
	await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0);
};

const showPhotoSection = async (page: Page) => {
	const section = page.getByRole('region', { name: /^Foto/ });
	await section.scrollIntoViewIfNeeded();
	const photo = section.getByRole('img');
	await expect(photo).toBeVisible();
	await expect
		.poll(() => photo.evaluate((image) => image instanceof HTMLImageElement && image.naturalWidth > 0))
		.toBe(true);
};

const generateBirthdayList = async (page: Page) => {
	await page.getByRole('combobox').selectOption(BIRTHDAY_MONTH);
	await page.getByRole('button', { name: 'Gerar lista' }).click();
	await expect(page.getByRole('cell', { name: BIRTHDAY_PERSON, exact: true })).toBeVisible();
};

export const SECRETARIA_SCREENS: readonly RepresentativeScreen[] = [
	{
		id: 'secretaria-inicio',
		role: 'reader',
		shell: true,
		path: () => '/secretaria',
		states: [
			{ id: 'carregando', hold: holdFrequenciaLock, open: openWhileAttendanceIsLocked },
			{
				id: 'inicial',
				prepare: (page) => expect(page.getByRole('heading', { level: 2 })).toHaveCount(INDICATOR_COUNT),
			},
		],
	},
	{
		id: 'cadastro-edicao',
		role: 'admin',
		shell: true,
		path: (seed) => `/secretaria/cadastros/${seed.cadastroWithPhotoId}`,
		states: [{ id: 'foto', prepare: showPhotoSection }],
	},
	{
		id: 'aniversariantes',
		role: 'reader',
		shell: true,
		print: true,
		path: () => '/secretaria/aniversariantes',
		states: [{ id: 'lista', prepare: generateBirthdayList }],
	},
];
