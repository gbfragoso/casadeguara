// @vitest-environment happy-dom
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', async () => ({ page: (await import('../support/page-state.svelte.js')).pageState }));

import Notification from '#lib/components/feedback/Notification.svelte';
import { pageState } from '../support/page-state.svelte.js';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';

const renderNotification = async (kind: 'success' | 'danger', message: string) => {
	const target = await renderComponent(Notification, { kind, children: htmlSnippet(`<span>${message}</span>`) });
	return getElement(target, '[data-testid="regiao-notificacao"]', HTMLDivElement);
};

const dismiss = async (notification: HTMLElement) => {
	getElement(notification, 'button[aria-label="Fechar aviso"]', HTMLButtonElement).click();
	await tick();
};

describe('Notification', () => {
	afterEach(() => {
		pageState.form = null;
	});

	it('shows the message inside the notification region', async () => {
		const notification = await renderNotification('success', 'Livro excluído com sucesso.');

		expect(notification.hidden).toBe(false);
		expect(notification.textContent).toContain('Livro excluído com sucesso.');
	});

	it.each([
		['success', 'status'],
		['danger', 'alert'],
	] as const)('announces a %s message with the %s role', async (kind, role) => {
		const notification = await renderNotification(kind, 'Mensagem');

		expect(notification.querySelector('p')?.getAttribute('role')).toBe(role);
	});

	it('hides the notification region from the close button', async () => {
		pageState.form = { status: 400 };
		const notification = await renderNotification('danger', 'Falha ao excluir.');

		await dismiss(notification);

		expect(notification.hidden).toBe(true);
	});

	it('shows again when a new action result arrives after being dismissed', async () => {
		pageState.form = { status: 201 };
		const notification = await renderNotification('success', 'Autor cadastrado com sucesso!');
		await dismiss(notification);

		pageState.form = { status: 201 };
		await tick();

		expect(notification.hidden).toBe(false);
	});
});
