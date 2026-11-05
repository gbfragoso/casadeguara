import { describe, expect, it } from 'vitest';

import { DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import { buildTalk, readLinks, readText, renderHome } from './home-page-support';

const SPEAKER = { nome: 'Carmélia Amorim', temFoto: true };

describe('home page hero', () => {
	it('announces the next talk as the page heading with its relative day and time', () => {
		const document = renderHome({ destaque: buildTalk(), seguintes: [] });

		expect(readText(document, 'h1')).toBe('A prece');
		expect(readText(document, '#inicio')).toContain('Hoje às 19h30');
	});

	it('shows the trimmed talk title as the heading text', () => {
		const document = renderHome({ destaque: buildTalk({ titulo: '  A fé raciocinada ' }), seguintes: [] });

		const heading = document.querySelector('h1');

		expect(heading?.textContent).toBe('A fé raciocinada');
	});

	it('introduces the speaker with the source work of the talk', () => {
		const destaque = buildTalk({ observacoes: 'O Livro dos Espíritos, questão 658' });

		const document = renderHome({ destaque, seguintes: [] });

		expect(readText(document, '#inicio')).toContain('Carmélia Amorim O Livro dos Espíritos, questão 658');
	});

	it('shows the speaker photo from the public talk photo route', () => {
		const document = renderHome({ destaque: buildTalk({ id: 31, palestrante: SPEAKER }), seguintes: [] });

		const photos = [...document.querySelectorAll('#inicio img')].map((image) => image.getAttribute('src'));

		expect(photos).toContain('/palestras/31/foto');
	});

	it('leaves the photo out when the speaker has none', () => {
		const document = renderHome({ destaque: buildTalk({ id: 31 }), seguintes: [] });

		const photos = [...document.querySelectorAll('#inicio img')].map((image) => image.getAttribute('src'));

		expect(photos).not.toContain('/palestras/31/foto');
	});

	it('names the place only when the talk happens away from the Casa', () => {
		const away = renderHome({ destaque: buildTalk({ local: 'Praça Olinto Leone' }), seguintes: [] });
		const atHome = renderHome({ destaque: buildTalk({ local: DEFAULT_TALK_LOCATION }), seguintes: [] });

		expect(readText(away, '#inicio')).toContain('Local: Praça Olinto Leone');
		expect(readText(atHome, '#inicio')).not.toContain('Local:');
	});

	it('lists what the meeting includes', () => {
		const destaque = buildTalk({ reuniaoCom: ['Estudo do Evangelho', 'Passes e água fluidificada'] });

		const document = renderHome({ destaque, seguintes: [] });

		expect(readText(document, '#inicio')).toContain(
			'A reunião inclui: Estudo do Evangelho, Passes e água fluidificada',
		);
	});

	it('points the main actions to the directions and the next talks', () => {
		const document = renderHome({ destaque: buildTalk(), seguintes: [] });

		const links = readLinks(document, '#inicio');

		expect(links).toEqual([
			['Como chegar', '#como-chegar'],
			['Ver as próximas palestras', '#palestras'],
		]);
	});

	it('keeps a heading for a talk without a title', () => {
		const document = renderHome({ destaque: buildTalk({ titulo: null }), seguintes: [] });

		expect(readText(document, 'h1')).toBe('Palestra pública');
	});

	it('says the program comes soon and points to Instagram when no talk is ready', () => {
		const document = renderHome({ destaque: null, seguintes: [] });

		expect(readText(document, 'h1')).toBe('A programação será divulgada em breve.');
		expect(readLinks(document, '#inicio')).toEqual([['Instagram', 'https://www.instagram.com/casadeguara/']]);
	});

	it('says the program could not be loaded and points to Instagram when loading fails', () => {
		const document = renderHome({ destaque: null, seguintes: [], programacaoIndisponivel: true });

		expect(readText(document, 'h1')).toBe('Não conseguimos carregar a programação agora.');
		expect(readLinks(document, '#inicio')).toEqual([['Instagram', 'https://www.instagram.com/casadeguara/']]);
	});
});

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
		const seguintes = [buildTalk({ id: 2, palestrante: SPEAKER })];

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
