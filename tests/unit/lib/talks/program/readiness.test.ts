import { describe, expect, it } from 'vitest';

import { checkProgramReadiness, type ProgramTalkFacts } from '#lib/talks/program/readiness.js';

const buildTalk = (overrides: Partial<ProgramTalkFacts> = {}): ProgramTalkFacts => ({
	id: 501,
	data: '2026-11-02',
	horario: '08:45',
	titulo: 'Ninguém pode ver o meu reino se não nascer de novo',
	palestrante: { nome: 'Alcione Soledade' },
	...overrides,
});

describe('TU-06 checkProgramReadiness with a complete month', () => {
	it('releases the talks in the order received', () => {
		const talks = [buildTalk({ id: 507, data: '2026-11-07' }), buildTalk({ id: 501 })];

		const readiness = checkProgramReadiness(talks);

		expect(readiness).toEqual({ status: 'pronta', talks });
	});
});

describe('TU-07 checkProgramReadiness with pending talks', () => {
	it('lists one pendency per incomplete talk with the board schedule and what is missing', () => {
		const talks = [
			buildTalk({ id: 501, palestrante: null }),
			buildTalk({ id: 503, data: '2026-11-04', horario: '19:30' }),
			buildTalk({ id: 507, data: '2026-11-07', horario: '14:30', titulo: null }),
			buildTalk({ id: 509, data: '2026-11-09', titulo: '', palestrante: null }),
		];

		const readiness = checkProgramReadiness(talks);

		expect(readiness).toEqual({
			status: 'pendente',
			pendencias: [
				{ id: 501, quando: 'Segunda-feira, 02/11/2026 · 08:45', falta: 'Falta o palestrante.' },
				{ id: 507, quando: 'Sábado, 07/11/2026 · 14:30', falta: 'Falta o título.' },
				{ id: 509, quando: 'Segunda-feira, 09/11/2026 · 08:45', falta: 'Faltam o título e o palestrante.' },
			],
		});
	});
});

describe('TU-08 checkProgramReadiness with an empty month', () => {
	it('blocks the month without talks', () => {
		expect(checkProgramReadiness([])).toEqual({ status: 'vazia' });
	});
});
