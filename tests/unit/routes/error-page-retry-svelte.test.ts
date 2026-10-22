// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({ page: { status: 500, error: { message: 'Internal Error' } } }));

import ErrorPage from '../../../src/routes/+error.svelte';
import { renderComponent } from '../lib/components/support/render-component.js';

describe('error page retry', () => {
	afterEach(() => vi.restoreAllMocks());

	it('reloads the page when the user retries after an unexpected failure', async () => {
		const reload = vi.spyOn(window.location, 'reload').mockImplementation(() => undefined);
		const target = await renderComponent(ErrorPage, {});

		target.querySelector('button')?.click();

		expect(reload).toHaveBeenCalledOnce();
	});
});
