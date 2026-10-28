import { describe, expect, it } from 'vitest';

import { createTestName, model, withBirthdayCadastros } from './test-support';

const NOVEMBER = 11;

describe('TI-01 listMonthBirthdays', () => {
	it('lists only November workers ordered by day and unaccented name', async () => {
		const prefix = createTestName('aniv');
		const seeds = [
			{ nome: `${prefix}BRUNO`, trab: true, aniversario: new Date('2001-11-07'), desencarnado: null },
			{ nome: `${prefix}ÁUREA`, trab: true, aniversario: new Date('1995-11-07'), desencarnado: true },
			{ nome: `${prefix}ANA`, trab: true, aniversario: new Date('1980-11-07'), desencarnado: false },
			{ nome: `${prefix}ZÉLIA`, trab: true, aniversario: new Date('1970-11-02'), desencarnado: false },
			{ nome: `${prefix}VISITANTE`, trab: false, aniversario: new Date('1990-11-07'), desencarnado: false },
			{ nome: `${prefix}SEMDATA`, trab: true, aniversario: null, desencarnado: false },
			{ nome: `${prefix}OUTUBRO`, trab: true, aniversario: new Date('1985-10-31'), desencarnado: false },
			{ nome: `${prefix}DEZEMBRO`, trab: true, aniversario: new Date('1985-12-01'), desencarnado: false },
		];

		await withBirthdayCadastros(seeds, async (created) => {
			const idByName = new Map(created.map(({ idleitor, nome }) => [nome, idleitor]));

			const birthdays = await model.listMonthBirthdays(NOVEMBER);

			expect(birthdays.filter(({ nome }) => nome.startsWith(prefix))).toEqual([
				{ id: idByName.get(`${prefix}ZÉLIA`), nome: `${prefix}ZÉLIA`, dia: 2, desencarnado: false },
				{ id: idByName.get(`${prefix}ANA`), nome: `${prefix}ANA`, dia: 7, desencarnado: false },
				{ id: idByName.get(`${prefix}ÁUREA`), nome: `${prefix}ÁUREA`, dia: 7, desencarnado: true },
				{ id: idByName.get(`${prefix}BRUNO`), nome: `${prefix}BRUNO`, dia: 7, desencarnado: false },
			]);
		});
	});
});
