// @vitest-environment happy-dom
import { tick, type ComponentProps } from 'svelte';
import { describe, expect, it } from 'vitest';

import TalkHistory from '#lib/components/talks/TalkHistory.svelte';
import { renderComponent } from '../support/render-component.js';
import { buildTalk, createRequestContext, findByLabel, pressKey, speakers, typeText } from './talk-fixtures';

type HistoryProps = ComponentProps<typeof TalkHistory>;

const pastTalks = [
	buildTalk({ id: 12, titulo: 'O passe', data: '2026-02-23' }),
	buildTalk({ id: 11, titulo: 'A prece', data: '2026-02-16' }),
];

const renderHistory = async (props: Partial<HistoryProps> = {}) => {
	const context = createRequestContext();
	const target = await renderComponent(TalkHistory, {
		talks: pastTalks,
		hoje: '2026-03-01',
		isAdmin: false,
		palestrantes: speakers,
		pagina: 1,
		temProxima: false,
		context,
		...props,
	});
	return { target, context };
};

const readLinks = (target: HTMLElement) =>
	[...target.querySelectorAll('nav a')].map((link) => [link.textContent?.trim(), link.getAttribute('href')]);

describe('TalkHistory', () => {
	it('lists the past talks read-only for volunteers', async () => {
		const { target } = await renderHistory();

		const names = [...target.querySelectorAll('article')].map((card) => card.getAttribute('aria-label'));

		expect(names).toEqual([
			'Segunda-feira, 23/02/2026 · 08:45 · O passe',
			'Segunda-feira, 16/02/2026 · 08:45 · A prece',
		]);
		expect(target.querySelector('button')).toBeNull();
	});

	it('lets the coordinator correct a past talk', async () => {
		const { target, context } = await renderHistory({ isAdmin: true });
		findByLabel(target, 'Editar título: O passe', HTMLButtonElement).click();
		await tick();
		const title = findByLabel(target, 'Título', HTMLInputElement);
		await typeText(title, 'O passe magnético');

		await pressKey(title, 'Enter');

		expect(context.submit).toHaveBeenCalledWith('?/atualizar', {
			id: '12',
			versao: '3',
			campo: 'titulo',
			valor: 'O passe magnético',
		});
	});

	it('lets the coordinator delete a past talk', async () => {
		const { target, context } = await renderHistory({ isAdmin: true });

		findByLabel(target, 'Confirmar exclusão da palestra A prece', HTMLButtonElement).click();
		await tick();

		expect(context.submit).toHaveBeenCalledWith('?/excluir', { id: '11' });
	});

	it('shows a message when there is no past talk', async () => {
		const { target } = await renderHistory({ talks: [] });

		expect(target.querySelector('[role="status"]')?.textContent).toBe('Nenhuma palestra no histórico.');
	});

	it('links to the newer and older history pages', async () => {
		const { target } = await renderHistory({ pagina: 2, temProxima: true });

		expect(readLinks(target)).toEqual([
			['Mais recentes', '/comunicacao/palestras?visao=historico&pagina=1'],
			['Mais antigas', '/comunicacao/palestras?visao=historico&pagina=3'],
		]);
	});

	it('hides the page links when the history fits in one page', async () => {
		const { target } = await renderHistory();

		expect(target.querySelector('nav')).toBeNull();
	});
});
