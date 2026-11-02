import { describe, expect, it } from 'vitest';

import { createTestName, model, withSeededCadastros } from './test-support';

describe('TI-01 listAttendanceWorkers', () => {
	it('lists only active marked workers in accent-insensitive order', async () => {
		const prefix = createTestName('freq');
		const seeds = [
			{ nome: `${prefix}ADRIANA`, trab: true, frequencia: true },
			{ nome: `${prefix}ÁDRIA`, trab: true, frequencia: true },
			{ nome: `${prefix}BRUNO`, trab: true, frequencia: true },
			{ nome: `${prefix}INATIVO`, trab: false, frequencia: true },
			{ nome: `${prefix}DESMARCADO`, trab: true, frequencia: false },
		];

		await withSeededCadastros(seeds, async () => {
			const workers = await model.listAttendanceWorkers();

			expect(workers.filter((nome) => nome.startsWith(prefix))).toEqual([
				`${prefix}ÁDRIA`,
				`${prefix}ADRIANA`,
				`${prefix}BRUNO`,
			]);
		});
	});
});
