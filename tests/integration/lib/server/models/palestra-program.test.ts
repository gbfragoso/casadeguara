import { db } from '#lib/server/database/connection.js';
import { PalestraModel } from '#lib/server/models/palestra.js';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from './palestra-test-support';

const talks = new PalestraModel(db);
const MAY_2104 = { firstDay: '2104-05-01', nextMonthFirstDay: '2104-06-01' };

describe('TI-01 PalestraModel month program', () => {
	it('reads only the requested month in date, time and id order with the speaker name', async () => {
		await withTalkFixtures(async ({ insertSpeaker, insertTalk, token }) => {
			const palestranteId = await insertSpeaker(`Programa Soledade ${token}`);
			await insertTalk({ data: '2104-04-30', horario: '19:30', titulo: 'Antes', palestranteId });
			const lastEvening = await insertTalk({
				data: '2104-05-31',
				horario: '19:30',
				titulo: 'Fim',
				palestranteId,
			});
			const lastMorning = await insertTalk({ data: '2104-05-31', horario: '08:45', titulo: null });
			const first = await insertTalk({
				data: '2104-05-01',
				horario: '08:45',
				titulo: 'A prece',
				observacoes: '(Cap. XXVII)',
				local: 'Praça da Matriz',
				palestranteId,
			});
			await insertTalk({ data: '2104-06-01', horario: '08:45', titulo: 'Depois', palestranteId });

			const program = await talks.listMonthProgram(MAY_2104);

			expect(program).toEqual([
				{
					id: first,
					data: '2104-05-01',
					horario: '08:45',
					titulo: 'A prece',
					observacoes: '(Cap. XXVII)',
					local: 'Praça da Matriz',
					palestrante: { nome: `Programa Soledade ${token}` },
				},
				expect.objectContaining({ id: lastMorning, horario: '08:45', titulo: null, palestrante: null }),
				expect.objectContaining({ id: lastEvening, horario: '19:30', titulo: 'Fim' }),
			]);
		});
	});
});
