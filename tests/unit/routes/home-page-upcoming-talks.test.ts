import { describe, expect, it } from 'vitest';

import { DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import { SPEAKER_WITH_PHOTO, buildTalk, readText, renderHome } from './home-page-support';

describe('home page upcoming talks', () => {
	it('lists each following talk with its day, time, theme and speaker', () => {
		const seguintes = [buildTalk({ id: 2, data: '2026-10-30', titulo: 'A fé raciocinada' })];

		const document = renderHome({ destaque: buildTalk(), seguintes });

		expect(readText(document, '#palestras li')).toBe('30 SEX · OUTUBRO19h30 A fé raciocinada Carmélia Amorim');
	});

	it('shows the talk notes below its theme', () => {
		const seguintes = [buildTalk({ id: 2, titulo: 'A fé raciocinada', observacoes: 'O Evangelho, capítulo 19' })];

		const document = renderHome({ destaque: buildTalk(), seguintes });

		expect(readText(document, '#palestras li')).toContain(
			'A fé raciocinada O Evangelho, capítulo 19 Carmélia Amorim',
		);
	});

	it('shows the speaker photo beside the speaker name', () => {
		const seguintes = [buildTalk({ id: 2, palestrante: SPEAKER_WITH_PHOTO })];

		const document = renderHome({ destaque: buildTalk(), seguintes });

		const photos = [...document.querySelectorAll('#palestras img')].map((image) => image.getAttribute('src'));
		expect(photos).toEqual(['/palestras/2/foto']);
	});

	it('tells when a following talk is tomorrow', () => {
		const seguintes = [buildTalk({ id: 2, data: '2026-10-29' })];

		const document = renderHome({ destaque: buildTalk(), seguintes });

		expect(readText(document, '#palestras li')).toContain('Amanhã às 19h30');
	});

	it('names the place of a following talk away from the Casa', () => {
		const seguintes = [buildTalk({ id: 2, local: 'Praça Olinto Leone' })];

		const document = renderHome({ destaque: buildTalk(), seguintes });

		expect(readText(document, '#palestras li')).toContain('Local: Praça Olinto Leone');
	});

	it('leaves the usual address out of a following talk', () => {
		const seguintes = [buildTalk({ id: 2, local: DEFAULT_TALK_LOCATION })];

		const document = renderHome({ destaque: buildTalk(), seguintes });

		expect(readText(document, '#palestras li')).not.toContain('Local:');
	});

	it('shows only the following talks that exist', () => {
		const seguintes = [buildTalk({ id: 2 }), buildTalk({ id: 3 })];

		const document = renderHome({ destaque: buildTalk(), seguintes });

		expect(document.querySelectorAll('#palestras li')).toHaveLength(2);
	});

	it('says the next dates come soon when only the featured talk is ready', () => {
		const document = renderHome({ destaque: buildTalk(), seguintes: [] });

		expect(readText(document, '#palestras')).toContain('As próximas datas serão divulgadas em breve.');
	});

	it('leaves the empty notice to the hero when no talk is ready', () => {
		const document = renderHome({ destaque: null, seguintes: [] });

		expect(readText(document, '#palestras')).not.toContain('serão divulgadas em breve');
	});

	it('leaves the failure notice to the hero when loading fails', () => {
		const document = renderHome({ destaque: null, seguintes: [], programacaoIndisponivel: true });

		expect(readText(document, 'main')).not.toContain('serão divulgadas em breve');
	});
});
