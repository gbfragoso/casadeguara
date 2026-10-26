import { describe, expect, it } from 'vitest';

import { TalkArtOverflowError } from '#lib/server/image/talk-art/blocks.js';
import { toTalkArtContent } from '#lib/server/image/talk-art/content.js';
import type { ArtElement } from '#lib/server/image/talk-art/elements.js';
import { layoutTalkArt, MAX_SECTION_GAP } from '#lib/server/image/talk-art/layout.js';
import { CA04_TALK, testMeasurers } from './support/art-fixtures';
import { boundsOf, listVerticalGaps } from './support/bounds';

const SPEAKER_PHOTO = new Uint8Array([0xff, 0xd8, 0xff]);

const describeContentElement = (element: ArtElement) => {
	if (element.kind === 'text') return `${element.role}: ${element.lines.join(' ')}`;
	if (element.kind === 'picture') return `imagem: ${element.source}`;
	return null;
};

const isContentElement = (element: ArtElement) =>
	element.kind === 'text' || element.kind === 'picture' || !['fundo', 'forma'].includes(element.fill);

describe('layoutTalkArt', () => {
	it('lays out every block of the CA-04 talk in the template order', () => {
		const talk = { ...CA04_TALK, palestrante: { ...CA04_TALK.palestrante, foto: SPEAKER_PHOTO } };

		const { elements } = layoutTalkArt(toTalkArtContent(talk), testMeasurers);

		expect(elements.map(describeContentElement).filter(Boolean)).toEqual([
			'imagem: logo',
			'instituicao: Grupo Espírita Casa de Guará',
			'dia: 26',
			'mes: OUTUBRO',
			'destaque: Segunda-feira, às 08h45',
			'titulo: NINGUÉM PODE VER O MEU REINO SE NÃO NASCER DE NOVO',
			'referencia: (Cap. IV)',
			'imagem: photo',
			'rotuloPalestrante: Palestrante:',
			'palestrante: ALCIONE SOLEDADE',
			'rotuloReuniao: Reunião com:',
			'atividade: Estudo do Evangelho',
			'atividade: Passes e água fluidificada',
			'atividade: Atendimento fraterno',
			'local: RUA MAJOR DÓREA, 86, CASTÁLIA, ITABUNA-BA',
		]);
	});

	it('omits empty reference, activities and location without leaving gaps', () => {
		const talk = { ...CA04_TALK, observacoes: null, reuniaoCom: [], local: null };

		const { elements } = layoutTalkArt(toTalkArtContent(talk), testMeasurers);

		const roles = elements.flatMap((element) => (element.kind === 'text' ? [element.role] : []));
		const gaps = listVerticalGaps(elements.filter(isContentElement).map(boundsOf));
		expect(roles).not.toEqual(expect.arrayContaining(['referencia', 'rotuloReuniao', 'atividade', 'local']));
		expect(Math.max(...gaps)).toBeLessThanOrEqual(MAX_SECTION_GAP);
	});

	it('rejects a text that does not fit its block at the minimum size', () => {
		const content = toTalkArtContent({ ...CA04_TALK, titulo: 'W'.repeat(200) });

		const layout = () => layoutTalkArt(content, testMeasurers);

		expect(layout).toThrow(expect.objectContaining({ name: 'TalkArtOverflowError', block: 'titulo' }));
	});

	it('rejects content taller than the art', () => {
		const content = toTalkArtContent({ ...CA04_TALK, reuniaoCom: Array.from({ length: 10 }, () => 'Passes') });

		const layout = () => layoutTalkArt(content, testMeasurers);

		expect(layout).toThrow(TalkArtOverflowError);
	});
});
