<script lang="ts">
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import type { Snippet } from 'svelte';
	import PublicHeader from '#lib/components/layout/PublicHeader.svelte';
	import Section from '#lib/components/layout/Section.svelte';

	type Props = { children: Snippet };

	let { children }: Props = $props();
</script>

<PublicHeader />
<main>
	<Section>
		{@render children()}
	</Section>
</main>
