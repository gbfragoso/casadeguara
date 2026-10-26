import { describe, expect, it } from 'vitest';

import { toTalkArtContent } from '#lib/server/image/talk-art/content.js';
import { CA04_TALK } from './support/art-fixtures';

describe('toTalkArtContent', () => {
	it('builds the art content from the CA-04 talk', () => {
		const talk = { ...CA04_TALK, titulo: CA04_TALK.titulo.normalize('NFD') };

		const content = toTalkArtContent(talk);

		expect(content).toEqual({
			dia: '26',
			mes: 'OUTUBRO',
			destaque: 'Segunda-feira, às 08h45',
			titulo: 'NINGUÉM PODE VER O MEU REINO SE NÃO NASCER DE NOVO',
			referencia: '(Cap. IV)',
			palestrante: 'ALCIONE SOLEDADE',
			atividades: ['Estudo do Evangelho', 'Passes e água fluidificada', 'Atendimento fraterno'],
			local: 'RUA MAJOR DÓREA, 86, CASTÁLIA, ITABUNA-BA',
			foto: null,
		});
	});

	it('omits blank notes and location', () => {
		const talk = { ...CA04_TALK, observacoes: '   ', local: null };

		const content = toTalkArtContent(talk);

		expect(content).toMatchObject({ referencia: null, local: null });
	});
});
