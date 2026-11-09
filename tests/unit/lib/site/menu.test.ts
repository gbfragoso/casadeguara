import { describe, expect, it } from 'vitest';

import { SITE_MENU, holdsCurrentPage, isCurrentPage, type SiteMenuGroup, type SiteMenuLink } from '#lib/site/menu.js';

const findGroup = (rotulo: string) =>
	SITE_MENU.find((item): item is SiteMenuGroup => item.kind === 'group' && item.rotulo === rotulo);

const describeLinks = (group: SiteMenuGroup | undefined) => group?.links.map((link) => [link.rotulo, link.path]);

const LIBRARY_LINK: SiteMenuLink = {
	kind: 'link',
	rotulo: 'Biblioteca',
	path: 'departamentos/biblioteca',
};

describe('site menu', () => {
	it('lists the first level in the order agreed with the Casa', () => {
		const labels = SITE_MENU.map((item) => item.rotulo);

		expect(labels).toEqual(['A instituição', 'Diretoria', 'Departamentos', 'Palestras', 'Material de Estudo']);
	});

	it('leads each department to its own page', () => {
		const links = describeLinks(findGroup('Departamentos'));

		expect(links).toEqual([
			['Biblioteca', 'departamentos/biblioteca'],
			['Evangelização', 'departamentos/evangelizacao'],
			['Juventude', 'departamentos/juventude'],
			['Manjedoura', 'departamentos/manjedoura'],
			['Recanto de Potira', 'departamentos/recanto'],
		]);
	});

	it('leads each study material to its own page', () => {
		const links = describeLinks(findGroup('Material de Estudo'));

		expect(links).toEqual([
			['Atendimento Fraterno', 'material-de-estudo/atendimento-fraterno'],
			['Codificação', 'material-de-estudo/codificacao'],
			['Curso de Passes', 'material-de-estudo/curso-de-passes'],
			['Evangelho no Lar', 'material-de-estudo/evangelho-no-lar'],
		]);
	});

	it('leads the single entries to their pages', () => {
		const links = SITE_MENU.filter((item) => item.kind === 'link').map((item) => [item.rotulo, item.path]);

		expect(links).toEqual([
			['A instituição', 'a-instituicao'],
			['Diretoria', 'diretoria'],
			['Palestras', 'palestras'],
		]);
	});

	it('keeps the Recanto de Potira and the directions out of the first level', () => {
		const labels = SITE_MENU.map((item) => item.rotulo);

		expect(labels).not.toEqual(expect.arrayContaining(['Recanto de Potira']));
		expect(labels).not.toEqual(expect.arrayContaining(['Como chegar']));
	});

	it('recognises the current page with or without a trailing slash', () => {
		const matches = ['/departamentos/biblioteca', '/departamentos/biblioteca/'].map((path) =>
			isCurrentPage(LIBRARY_LINK, path),
		);

		expect(matches).toEqual([true, true]);
	});

	it('does not take another page for the current one', () => {
		expect(isCurrentPage(LIBRARY_LINK, '/departamentos/recanto')).toBe(false);
	});

	it('tells which group holds the current page', () => {
		const groups = SITE_MENU.filter((item) => item.kind === 'group');

		const holding = groups.map((group) => holdsCurrentPage(group, '/material-de-estudo/codificacao'));

		expect(holding).toEqual([false, true]);
	});
});
