// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import Notification from '#lib/components/feedback/Notification.svelte';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';

describe('Notification', () => {
	it('shows the message inside the notification region', async () => {
		const target = await renderComponent(Notification, {
			kind: 'success',
			children: htmlSnippet('<span>Livro excluído com sucesso.</span>'),
		});

		const notification = getElement(target, '[data-testid="regiao-notificacao"]', HTMLDivElement);

		expect(notification.hidden).toBe(false);
		expect(notification.textContent).toContain('Livro excluído com sucesso.');
	});

	it('hides the notification region from the close button', async () => {
		const target = await renderComponent(Notification, {
			kind: 'danger',
			children: htmlSnippet('<span>Falha ao excluir.</span>'),
		});
		const notification = getElement(target, '[data-testid="regiao-notificacao"]', HTMLDivElement);

		getElement(notification, 'button[aria-label="open"]', HTMLButtonElement).click();
		await tick();

		expect(notification.hidden).toBe(true);
	});
});
