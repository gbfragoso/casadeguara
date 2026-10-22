// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';

import LoadError from '#lib/components/feedback/LoadError.svelte';
import { getElement, renderComponent } from '../support/render-component.js';

describe('LoadError', () => {
	afterEach(() => vi.restoreAllMocks());

	it('announces the failure with its message', async () => {
		const target = await renderComponent(LoadError, { message: 'Não foi possível carregar os usuários.' });

		expect(getElement(target, '[role="alert"]', HTMLElement).textContent).toContain(
			'Não foi possível carregar os usuários.',
		);
	});

	it('reloads the page when the user retries', async () => {
		const reload = vi.spyOn(window.location, 'reload').mockImplementation(() => undefined);
		const target = await renderComponent(LoadError, { message: 'Falha.' });

		getElement(target, 'button', HTMLButtonElement).click();

		expect(reload).toHaveBeenCalledOnce();
	});
});
