<script lang="ts">
	import type { Snippet } from 'svelte';
	import Section from '#lib/components/layout/Section.svelte';

	type Props = { children: Snippet };

	let { children }: Props = $props();
</script>

<main>
	<Section>
		{@render children()}
	</Section>
</main>
