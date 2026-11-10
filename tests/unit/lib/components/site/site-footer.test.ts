// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import SiteFooter from '#lib/components/site/SiteFooter.svelte';
import { renderComponent } from '../support/render-component.js';

const readLinks = (container: ParentNode, selector: string) =>
	[...container.querySelectorAll(selector)].map((link) => [
		link.getAttribute('aria-label') ?? link.textContent?.trim(),
		link.getAttribute('href'),
	]);

describe('SiteFooter', () => {
	it('links Instagram and YouTube by accessible name', async () => {
		const target = await renderComponent(SiteFooter, {});

		const social = readLinks(target, 'ul[aria-label="Redes sociais"] a');

		expect(social).toEqual([
			['Instagram', 'https://www.instagram.com/casadeguara/'],
			['YouTube', 'https://www.youtube.com/channel/UCFz1gRHG5bq750Nma0Ttc4w'],
		]);
	});

	it('shows the social networks as icons without visible text', async () => {
		const target = await renderComponent(SiteFooter, {});

		const texts = [...target.querySelectorAll('ul[aria-label="Redes sociais"] a')].map((link) =>
			link.textContent?.trim(),
		);

		expect(texts).toEqual(['', '']);
	});

	it('draws each social network with its own brand mark', async () => {
		const target = await renderComponent(SiteFooter, {});

		const marks = [...target.querySelectorAll('ul[aria-label="Redes sociais"] a svg')].map((icon) =>
			icon.getAttribute('data-icon'),
		);

		expect(marks).toEqual(['instagram', 'youtube']);
	});

	it('keeps the e-mail contact', async () => {
		const target = await renderComponent(SiteFooter, {});

		expect(readLinks(target, 'a[href^="mailto:"]')).toEqual([
			['contato@casadeguara.org', 'mailto:contato@casadeguara.org'],
		]);
	});

	it('repeats the site menu in its order and ends with the login', async () => {
		const target = await renderComponent(SiteFooter, {});

		const links = readLinks(target, 'nav a').map(([label]) => label);

		expect(links).toEqual([
			'A instituição',
			'Diretoria',
			'Biblioteca',
			'Evangelização',
			'Juventude',
			'Manjedoura',
			'Recanto de Potira',
			'Palestras',
			'Atendimento Fraterno',
			'Codificação',
			'Curso de Passes',
			'Evangelho no Lar',
			'Login',
		]);
	});

	it('names each menu group above its pages', async () => {
		const target = await renderComponent(SiteFooter, {});

		const groups = [...target.querySelectorAll('nav li:has(> ul) > span')].map((label) => label.textContent);

		expect(groups).toEqual(['Departamentos', 'Material de Estudo']);
	});
});
