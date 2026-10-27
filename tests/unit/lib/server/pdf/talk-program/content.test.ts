import { describe, expect, it } from 'vitest';

import { toProgramEntryContent } from '#lib/server/pdf/talk-program/content.js';
import { BASE_TALK } from './support/program-fixtures';

describe('toProgramEntryContent', () => {
	it('formats the talk texts of the sheet', () => {
		const talk = { ...BASE_TALK, titulo: BASE_TALK.titulo.normalize('NFD') };

		const content = toProgramEntryContent(talk);

		expect(content).toEqual({
			dia: '02',
			diaSemana: 'SEG',
			horario: '08h45',
			titulo: 'Ninguém pode ver o reino de Deus se não nascer de novo',
			observacao: '(Cap. IV)',
			palestrante: 'Palestrante: Alcione Soledade',
			local: null,
		});
	});

	it('shows a location outside the house', () => {
		const talk = { ...BASE_TALK, local: '  Lar Fabiano de Cristo, Itabuna ' };

		const { local } = toProgramEntryContent(talk);

		expect(local).toBe('Local: Lar Fabiano de Cristo, Itabuna');
	});

	it.each([
		{ name: 'the default address', local: 'Rua Major Dórea, 86, Castália, Itabuna-BA' },
		{ name: 'the default address in other case', local: 'RUA MAJOR DÓREA, 86, CASTÁLIA, ITABUNA-BA' },
		{ name: 'the default address with surrounding spaces', local: '  Rua Major Dórea, 86, Castália, Itabuna-BA  ' },
		{ name: 'a null location', local: null },
		{ name: 'a blank location', local: '   ' },
	])('omits the location for $name', ({ local }) => {
		const talk = { ...BASE_TALK, local };

		const content = toProgramEntryContent(talk);

		expect(content.local).toBeNull();
	});
});
