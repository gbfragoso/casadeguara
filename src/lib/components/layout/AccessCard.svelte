<script lang="ts">
	import type { Snippet } from 'svelte';
	import Card from '#lib/components/layout/Card.svelte';
	import Section from '#lib/components/layout/Section.svelte';

	type Props = { children: Snippet };

	let { children }: Props = $props();
</script>

<main class="min-h-dvh">
	<Section class="grid justify-items-center">
		<Card class="mt-6 w-full max-w-access border-t-4 border-t-primary tablet:mt-12">
			{@render children()}
		</Card>
	</Section>
</main>
