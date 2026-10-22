<script lang="ts">
	import { trackThemeChange } from '#lib/theme/theme-change.js';

	const theme = $derived.by(() => {
		trackThemeChange();
		const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		return document.documentElement.dataset.theme ?? systemTheme;
	});
</script>

<output>{theme}</output>
