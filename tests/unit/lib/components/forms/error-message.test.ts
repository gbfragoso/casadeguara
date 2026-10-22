// @vitest-environment happy-dom
import { createAttachmentKey } from 'svelte/attachments';
import { describe, expect, it, vi } from 'vitest';

import ErrorMessage from '#lib/components/forms/ErrorMessage.svelte';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';

describe('ErrorMessage', () => {
	it('announces the message with a decorative icon that adds no text', async () => {
		const target = await renderComponent(ErrorMessage, {
			role: 'alert',
			children: htmlSnippet('<span>Informe o período.</span>'),
		});

		const message = getElement(target, 'p[role="alert"]', HTMLParagraphElement);
		expect(message.textContent?.trim()).toBe('Informe o período.');
		expect(message.querySelector('i')?.getAttribute('aria-hidden')).toBe('true');
	});

	it('renders the requested element with the id, focus order and attachment given by the screen', async () => {
		const attach = vi.fn();

		const target = await renderComponent(ErrorMessage, {
			element: 'div',
			id: 'motivo-errors',
			tabindex: -1,
			[createAttachmentKey()]: attach,
			children: htmlSnippet('<span>Informe o motivo.</span>'),
		});

		const message = getElement(target, '#motivo-errors', HTMLDivElement);
		expect(message.tabIndex).toBe(-1);
		expect(attach).toHaveBeenCalledWith(message);
	});
});
