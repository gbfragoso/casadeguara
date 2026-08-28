// @vitest-environment happy-dom
import { mount, tick, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';

import Notification from '$lib/components/Notification.svelte';

describe('Notification', () => {
	it('stays above application layers and can be dismissed', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(Notification, {
			target,
			props: { class: 'is-success' },
		});
		await tick();

		const notification = target.querySelector('.notification');
		const closeButton = target.querySelector('button[aria-label="open"]');
		if (!(notification instanceof HTMLDivElement) || !(closeButton instanceof HTMLButtonElement))
			throw new Error('Notification controls were not rendered.');

		expect(notification.style.zIndex).toBe('50');
		closeButton.click();
		await tick();

		expect(notification.style.display).toBe('none');
		unmount(component);
		target.remove();
	});
});
