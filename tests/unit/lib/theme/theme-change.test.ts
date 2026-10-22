// @vitest-environment happy-dom
import { mount, tick, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ThemeProbe from './support/ThemeProbe.svelte';
import { renderComponent } from '../components/support/render-component.js';

type FakeColorScheme = EventTarget & { matches: boolean; media: string };

const readTheme = (target: HTMLElement) => target.querySelector('output')?.textContent;

const fakeColorScheme = (matches: boolean): FakeColorScheme =>
	Object.assign(new EventTarget(), { matches, media: '(prefers-color-scheme: dark)' });

afterEach(() => {
	document.documentElement.removeAttribute('data-theme');
	vi.restoreAllMocks();
});

describe('trackThemeChange', () => {
	it('updates its readers when the theme toggle switches the theme', async () => {
		const target = await renderComponent(ThemeProbe, {});

		document.documentElement.dataset.theme = 'dark';

		await vi.waitFor(() => expect(readTheme(target)).toBe('dark'));
	});

	it('updates its readers when the system color scheme changes', async () => {
		const colorScheme = fakeColorScheme(false);
		vi.spyOn(window, 'matchMedia').mockReturnValue(colorScheme as unknown as MediaQueryList);
		const target = await renderComponent(ThemeProbe, {});

		colorScheme.matches = true;
		colorScheme.dispatchEvent(new Event('change'));
		await tick();

		expect(readTheme(target)).toBe('dark');
	});

	it('keeps tracking after its reader is unmounted and mounted again', async () => {
		const first = mount(ThemeProbe, { target: document.body.appendChild(document.createElement('div')) });
		await tick();
		await unmount(first);
		const target = await renderComponent(ThemeProbe, {});

		document.documentElement.dataset.theme = 'light';

		await vi.waitFor(() => expect(readTheme(target)).toBe('light'));
	});
});
