<script lang="ts">
	import '@fontsource-variable/bricolage-grotesque';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import SiteFooter from '#lib/components/site/SiteFooter.svelte';
	import SiteHeader from '#lib/components/site/SiteHeader.svelte';

	type Props = { children: Snippet };

	let { children }: Props = $props();
</script>

<div data-site class="relative bg-ground text-ink">
	<SiteHeader currentPath={page.url.pathname} />
	<main>
		{@render children()}
	</main>
	<SiteFooter />
</div>

<style>
	@media (prefers-reduced-motion: no-preference) {
		:global(html:has([data-site])) {
			scroll-behavior: smooth;
		}
	}
</style>
