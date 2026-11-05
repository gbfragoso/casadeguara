import { describe, expect, it } from 'vitest';

import { DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import { SPEAKER_WITH_PHOTO, buildTalk, readLinks, readText, renderHome } from './home-page-support';

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

	it('lists each activity included in the meeting as its own item', () => {
		const destaque = buildTalk({ reuniaoCom: ['Estudo do Evangelho', 'Passes e água fluidificada'] });

		const document = renderHome({ destaque, seguintes: [] });

		const activities = [...document.querySelectorAll('#inicio ul li')].map((item) => item.textContent);

		expect(activities).toEqual(['Estudo do Evangelho', 'Passes e água fluidificada']);
	});

	it('introduces the speaker with the source work of the talk', () => {
		const destaque = buildTalk({ observacoes: 'O Livro dos Espíritos, questão 658' });

		const document = renderHome({ destaque, seguintes: [] });

		expect(readText(document, '#inicio')).toContain('Carmélia Amorim O Livro dos Espíritos, questão 658');
	});

	it('shows the speaker photo from the public talk photo route', () => {
		const document = renderHome({
			destaque: buildTalk({ id: 31, palestrante: SPEAKER_WITH_PHOTO }),
			seguintes: [],
		});

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
