import { createSubscriber } from 'svelte/reactivity';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export const trackThemeChange = createSubscriber((update) => {
	const themeAttribute = new MutationObserver(update);
	themeAttribute.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
	const darkScheme = window.matchMedia(DARK_SCHEME_QUERY);
	darkScheme.addEventListener('change', update);
	return () => {
		themeAttribute.disconnect();
		darkScheme.removeEventListener('change', update);
	};
});
